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
using System.Security.Claims;

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
            ViewData["inventoryItems"] = await GetInventoryItems();

            return View();
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

            var message = JsonConvert.DeserializeObject<Dictionary<string, string>>(
                await response.Content.ReadAsStringAsync()
                );

            TempData["message"] = $"danger-{message?["message"]}";
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Edit(Item item)
        {
            var json = JsonConvert.SerializeObject(item);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync($"{ApiUrl}/{item.id}", content);

            var message = JsonConvert.DeserializeObject<Dictionary<string, string>>(
                await response.Content.ReadAsStringAsync()
                );

            if (response.IsSuccessStatusCode)
            {
                TempData["message"] = $"success-{message?["message"]}";
                return RedirectToAction(nameof(Index));
            }

            TempData["message"] = $"warning-{message?["message"]}";
            return View(item);
        }

        public async Task<IActionResult> Delete(int id)
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync($"{ApiUrl}/{id}");

            var message = JsonConvert.DeserializeObject<Dictionary<string, string>>(
                await response.Content.ReadAsStringAsync()
                );

            TempData["message"] = $"{(response.IsSuccessStatusCode ? "success" : "danger")}-{message?["message"]}";

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                TempData["message"] = "warning-File is empty or missing";
                return RedirectToAction(nameof(Index));
            }

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

                                if (dt.Columns.Contains("Inventory ID"))
                                    if (row["Inventory ID"].ToString() != "")
                                        item.id = int.Parse(row["Inventory ID"].ToString());

                                if (dt.Columns.Contains("Title"))
                                    if (row["Title"].ToString() != "")
                                        item.title = row["Title"].ToString();

                                if (dt.Columns.Contains("Place"))
                                    if (row["Place"].ToString() != "")
                                        item.place = row["Place"].ToString();

                                if (dt.Columns.Contains("State"))
                                    if (row["State"].ToString() != "")
                                        item.state = row["State"].ToString();

                                if (dt.Columns.Contains("Quantity"))
                                    if (row["Quantity"].ToString() != "")
                                        item.quantity = float.Parse(row["Quantity"].ToString());

                                if (dt.Columns.Contains("Logical quantity"))
                                    if (row["Logical quantity"].ToString() != "")
                                        item.logical_quantity = float.Parse(row["Logical quantity"].ToString());

                                if (dt.Columns.Contains("Unit"))
                                    if (row["Unit"].ToString() != "")
                                        item.unit = row["Unit"].ToString();

                                if (dt.Columns.Contains("QR code/Barcode"))
                                    if (row["QR code/Barcode"].ToString() != "")
                                        item.code = row["QR code/Barcode"].ToString();

                                if (dt.Columns.Contains("Notes"))
                                    if (row["Notes"].ToString() != "")
                                        item.etc = row["Notes"].ToString();

                                if (dt.Columns.Contains("Updated at"))
                                    if (row["Updated at"].ToString() != "")
                                        item.updated_at = DateTime.Parse(row["Updated at"].ToString()).ToString("yyyy-MM-ddTHH:mm:sszzz");

                                if (dt.Columns.Contains("Created at"))
                                    if (row["Created at"].ToString() != "")
                                        item.created_at = DateTime.Parse(row["Created at"].ToString()).ToString("yyyy-MM-ddTHH:mm:sszzz");

                                if (dt.Columns.Contains("Group Tag"))
                                    if (row["Group Tag"].ToString() != "")
                                        item.group_tag = row["Group Tag"].ToString();

                                var columnNames = new List<string> 
                                { 
                                    "Cost per Unit", 
                                    "Fixed Asset number", 
                                    "Invoice Date", 
                                    "Invoice#", 
                                    "TotaCostJPY", 
                                    "Delivery number", 
                                    "SOJ Note", 
                                    "SSG Account", 
                                    "Received date", 
                                    "FixAsset Start Use Day", 
                                    "Group", 
                                    "Vendor(From)", 
                                    "Original Amount in foreign currency", 
                                    "Exchage Rate", 
                                    "Updated Quantity(%)", 
                                    "Paid Date", 
                                    "Stock taken date (Old stocktake)", 
                                    "Stocktake difference (Old stocktake)", 
                                    "For manager", 
                                    "Location in Zama", 
                                    "Location in Container" 
                                };

                                foreach (var column in columnNames)
                                {
                                    if (dt.Columns.Contains(column))
                                {
                                        if (row[column].ToString() != "")
                                    {
                                        item.optional_attributes.Add(new OptionalAttribute
                                        {
                                                name = column,
                                                value = row[column].ToString()
                                        });
                                    }
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
                                    //var result = await _httpClient.GetAsync($"{ApiUrl}");

                                    if (result.IsSuccessStatusCode)
                                        Console.WriteLine("Saved item ID: " + item.id);
                                    else
                                    {
                                        Console.WriteLine($"Unable to save item ID: {item.id} ");
                                        var error = JsonConvert.DeserializeObject<Dictionary<string, string>>(
                                            await result.Content.ReadAsStringAsync()
                                            );

                                        if (error?["message"] != null && error?["message"] != "")
                                    {
                                            Console.WriteLine(error?["message"]);
                                        }
                                    }
                                }
                                else
                                {
                                    Console.WriteLine("Skipping item ID: " + item.id);
                                }
                            } else
                            {
                                Console.WriteLine("Not found item ID: " + item.id);
                            }
                        }

                        TempData["message"] = "success-Inventory items has been updated.";
                    }
                }
                else if(Path.GetExtension(file.FileName).ToLower() == ".xlsx")
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
                } else
                {
                    TempData["message"] = "danger-Unable to read file.";
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

                    //if (list1.Count != list2.Count)
                    //    return false;

                    foreach (var item in list2)
                    {
                        var item1Value = list1.FirstOrDefault(x => x.name == item.name);
                        if (item1Value == null)
                        {
                            Console.WriteLine($"New attribute data - {item.name}: {item.value}");
                        return false;
                        } 
                        else
                    {
                            if (item.value != item1Value.value)
                        {
                                Console.WriteLine($"Updating {item.name}: From {item1Value.value} to {item.value}");
                            return false;
                        }
                    }
                }
                }
                else
                {
                    if (!value1.Equals(value2))
                    {
                        Console.WriteLine($"Updating {property.Name}: From {value1} to {value2}");
                        return false;
                }
            }
            }

            return true;
        }

        public int GetPersonnelID()
        {
            var personnelId = int.Parse(User.FindFirstValue("Personnelid"));

            return personnelId;
        }

        public string GetUserFullname()
        {
            var firstName = User.FindFirstValue(ClaimTypes.GivenName);
            var lastName = User.FindFirstValue(ClaimTypes.Surname);

            return $"{firstName} {lastName}";
        }

    }
}
