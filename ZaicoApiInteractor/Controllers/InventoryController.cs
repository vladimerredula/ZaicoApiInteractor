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

namespace ZaicoApiInteractor.Controllers
{
    [Authorize]
    public class InventoryController : Controller
    {
        private readonly HttpClient _httpClient;
        private const string ApiUrl = "https://web.zaico.co.jp/api/v1/inventories";
        private const string ApiToken = "your_token_here";

        public InventoryController()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ApiToken);
        }

        public async Task<IActionResult> Index()
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

                return View(items);
            }

            return View(new List<Item>());
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

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
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
                            quantity = float.Parse(row.Cell(6).GetValue<string>()),
                            place = row.Cell(4).GetValue<string>()
                        };

                        var json = JsonConvert.SerializeObject(item);
                        var content = new StringContent(json, Encoding.UTF8, "application/json");
                        await _httpClient.PutAsync($"{ApiUrl}/{item.id}", content);
                    }
                }
            }

            return RedirectToAction("Index");
        }
    }
}
