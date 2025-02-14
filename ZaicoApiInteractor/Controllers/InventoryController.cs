using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using ZaicoApiInteractor.Models;
using ClosedXML.Excel;
using Item = ZaicoApiInteractor.Models.Item;
using CsvHelper;
using System.Globalization;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Reflection;

namespace ZaicoApiInteractor.Controllers
{
    [Authorize]
    public class InventoryController : Controller
    {
        private readonly HttpClient _httpClient;
        private const string ApiUrl = "https://web.zaico.co.jp/api/v1/inventories";
        private const string ApiToken = "api_token_here";

        public InventoryController()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ApiToken);
        }

        public async Task<IActionResult> Index()
        {
            List<Item> items = await GetInventoryItems();

            return View(items);
        }

        public async Task<List<Item>> GetInventoryItems()
        {
            List<Item> items = new List<Item>();

            HttpResponseMessage response = await _httpClient.GetAsync(ApiUrl);
            if (response.IsSuccessStatusCode)
            {
                var newItems = new List<Item>();

                if (response.Headers.Contains("Link"))
                {
                    var totalCount = response.Headers.GetValues("Total-Count");
                    var pageCount = (int)Math.Ceiling(int.Parse(totalCount.First()) / 1000.0);

                    for (int i = 1; i <= pageCount; i++)
                    {
                        var sample = await _httpClient.GetAsync($"{ApiUrl}?page={i}");
                        if (sample.IsSuccessStatusCode)
                        {
                            var sampleData = await sample.Content.ReadAsStringAsync();
                            var sampleItem = JsonConvert.DeserializeObject<List<Item>>(sampleData);
                            items.AddRange(sampleItem);
                        }
                    }
                }
            }

            return items;
        }

        public async Task<IActionResult> Edit(int id)
        {
            HttpResponseMessage response = await _httpClient.GetAsync($"{ApiUrl}/{id}");
            if (response.IsSuccessStatusCode)
            {
                string data = await response.Content.ReadAsStringAsync();
                var item = JsonConvert.DeserializeObject<Item>(data);
                return View(item);
            }

            return NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> Edit(Item item)
        {
            var json = JsonConvert.SerializeObject(item);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync($"{ApiUrl}/{item.id}", content);

            if (response.IsSuccessStatusCode)
                return RedirectToAction("Index");

            return View(item);
        }

        public async Task<IActionResult> Delete(int id)
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync($"{ApiUrl}/{id}");
            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty or missing");

            var items = new List<Item>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                if (Path.GetExtension(file.FileName).ToLower() == ".csv")
                {
                    using (var reader = new StreamReader(stream))
                    using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
                    {
                        using (var dr = new CsvDataReader(csv))
                        {
                            var dt = new DataTable();
                            dt.Load(dr);

                            foreach (DataRow row in dt.Rows)
                            {
                                var item = new Item
                                {
                                    user_group = "Base group",
                                    optional_attributes = new List<OptionalAttribute>()
                                };

                                if (row[0].ToString() != "")
                                    item.id = int.Parse(row[0].ToString());

                                if (row[1].ToString() != "")
                                    item.title = row[1].ToString();

                                if (row[3].ToString() != "")
                                    item.place = row[3].ToString();

                                if (row[4].ToString() != "")
                                    item.state = row[4].ToString();

                                if (row[5].ToString() != "")
                                    item.quantity = float.Parse(row[5].ToString());

                                if (row[6].ToString() != "")
                                    item.unit = row[6].ToString();

                                if (row[7].ToString() != "")
                                    item.code = row[7].ToString();

                                if (row[8].ToString() != "")
                                    item.etc = row[8].ToString();

                                if (row[9].ToString() != "")
                                    item.updated_at = DateTime.Parse(row[9].ToString()).ToString("yyyy-MM-ddTHH:mm:sszzz");

                                if (row[10].ToString() != "")
                                    item.created_at = DateTime.Parse(row[10].ToString()).ToString("yyyy-MM-ddTHH:mm:sszzz");

                                if (row[13].ToString() != "")
                                    item.group_tag = row[13].ToString();

                                for (int i = 14; i < dt.Columns.Count; i++)
                                {
                                    if (row[i].ToString() != "")
                                    {
                                        item.optional_attributes.Add(new OptionalAttribute
                                        {
                                            name = dt.Columns[i].ColumnName,
                                            value = row[i].ToString()
                                        });
                                    }
                                }

                                items.Add(item);
                            }
                        }

                        var inventoryItems = await GetInventoryItems();

                        foreach (var item in items)
                        {
                            var inventoryItem = inventoryItems.FirstOrDefault(i => i.id == item.id);

                            if (inventoryItem != null)
                            {
                                // Compare data if there are changes made
                                if (!AreEqual(inventoryItem, item))
                                {
                                    // Change the update date now as changes has been made
                                    item.updated_at = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:sszzz");
                                    var json = JsonConvert.SerializeObject(item);
                                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                                    var result = await _httpClient.PutAsync($"{ApiUrl}/{item.id}", content);

                                    if (!result.IsSuccessStatusCode)
                                    {
                                        Console.WriteLine(await result.Content.ReadAsStringAsync());
                                    }

                                    Console.WriteLine("Saved item ID: " + item.id);
                                }
                                else
                                {
                                    Console.WriteLine("Skipping item ID: " + item.id);
                                }
                            }
                        }
                    }
                }
                else
                {
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheet(1);
                        var rows = worksheet.RangeUsed().RowsUsed();

                        foreach (var row in rows.Skip(1)) // Skipping header
                        {
                            var item = new Item
                            {
                                id = int.Parse(row.Cell(1).GetValue<string>()),
                                title = row.Cell(2).GetValue<string>(),
                                quantity = int.Parse(row.Cell(3).GetValue<string>()),
                                place = row.Cell(4).GetValue<string>(),
                                optional_attributes = new List<OptionalAttribute>()
                            };

                            // Assuming optional attributes start from column 5
                            for (int col = 5; col <= row.CellCount(); col += 2)
                            {
                                string key = row.Cell(col).GetValue<string>();
                                string value = row.Cell(col + 1).GetValue<string>();
                                item.optional_attributes.Add(new OptionalAttribute { name = key, value = value });
                            }

                            var json = JsonConvert.SerializeObject(item);
                            var content = new StringContent(json, Encoding.UTF8, "application/json");
                            await _httpClient.PutAsync($"{ApiUrl}/{item.id}", content);
                        }
                    }
                }
            }

            return RedirectToAction("Index");
        }

        public static bool AreEqual<T>(T obj1, T obj2)
        {
            if (obj1 == null || obj2 == null)
                return false;

            PropertyInfo[] properties = typeof(T).GetProperties();

            foreach (var property in properties)
            {
                // Skip the updated_at property
                if (property.Name == "updated_at")
                    continue;

                var value1 = property.GetValue(obj1);
                var value2 = property.GetValue(obj2);

                if (value1 == null || value2 == null)
                    continue;


                // If it's a list, compare each element
                if (typeof(List<OptionalAttribute>).IsAssignableFrom(property.PropertyType))
                {
                    var list1 = (List<OptionalAttribute>)value1;
                    var list2 = (List<OptionalAttribute>)value2;

                    if (list1.Count != list2.Count)
                        return false;

                    foreach (var item in list1)
                    {
                        var item2Value = list2.First(x => x.name == item.name).value;
                        if (item.value != item2Value)
                        {
                            return false;
                        }
                    }
                }
                else
                {
                    if (!value1.Equals(value2))
                        return false;
                }
            }

            return true;
        }
    }
}
