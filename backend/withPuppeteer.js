const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const requestParams = {
  baseURL: `http://google.com`,
  coordinates: "@47.6040174,-122.1854488,11z", // parameter defines GPS coordinates of location where you want your query to be applied
  hl: "en", // parameter defines the language to use for the Google maps search
};

async function scrollPage(page, scrollContainer) {
  let lastHeight = await page.evaluate(
    `document.querySelector("${scrollContainer}").scrollHeight`
  );

  while (true) {
    await page.evaluate(
      `document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`
    );
    await page.waitForTimeout(5000);
    let newHeight = await page.evaluate(
      `document.querySelector("${scrollContainer}").scrollHeight`
    );
    if (newHeight === lastHeight) {
      break;
    }
    lastHeight = newHeight;
  }
}

async function fillDataFromPage(page) {
  const dataFromPage = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".bfdHYd")).map((el) => {
      const placeUrl = el.parentElement
        .querySelector(".hfpxzc")
        ?.getAttribute("href");
      const urlPattern =
        /!1s(?<id>[^!]+).+!3d(?<latitude>[^!]+)!4d(?<longitude>[^!]+)/gm; // https://regex101.com/r/KFE09c/1
      const dataId = [...placeUrl.matchAll(urlPattern)].map(
        ({ groups }) => groups.id
      )[0];
      const latitude = [...placeUrl.matchAll(urlPattern)].map(
        ({ groups }) => groups.latitude
      )[0];
      const longitude = [...placeUrl.matchAll(urlPattern)].map(
        ({ groups }) => groups.longitude
      )[0];
      return {
        title: el.querySelector(".qBF1Pd")?.textContent.trim(),
        rating: el.querySelector(".MW4etd")?.textContent.trim(),
        reviews: el
          .querySelector(".UY7F9")
          ?.textContent.replace("(", "")
          .replace(")", "")
          .trim(),
        type: el
          .querySelector(
            ".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:first-child"
          )
          ?.textContent.replaceAll("·", "")
          .trim(),
        address: el
          .querySelector(
            ".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:last-child"
          )
          ?.textContent.replaceAll("·", "")
          .trim(),
        openState: el
          .querySelector(
            ".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:first-child"
          )
          ?.textContent.replaceAll("·", "")
          .trim(),
        phone: el
          .querySelector(
            ".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:last-child"
          )
          ?.textContent.replaceAll("·", "")
          .trim(),
        website: el.querySelector("a[data-value]")?.getAttribute("href"),
        description: el
          .querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(2)")
          ?.textContent.replace("·", "")
          .trim(),
        serviceOptions: el
          .querySelector(".qty3Ue")
          ?.textContent.replaceAll("·", "")
          .replaceAll("  ", " ")
          .trim(),
        gpsCoordinates: {
          latitude,
          longitude,
        },
        placeUrl,
        dataId,
      };
    });
  });
  return dataFromPage;
}

async function getLocalPlacesInfo(searchFilter) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const URL = `${requestParams.baseURL}/maps/search/${searchFilter}?hl=${requestParams.hl}`;

  console.log("===> 1 URL:", URL)
  await page.setDefaultNavigationTimeout(60000);
  await page.goto(URL);

  await page.waitForNavigation();

  const scrollContainer = ".m6QErb[aria-label]";

  const localPlacesInfo = [];

  // while (true) {
  await page.waitForTimeout(2000);
  // const nextPageBtn = await page.$("#eY4Fjd:not([disabled])");
  // if (!nextPageBtn) break;
  await scrollPage(page, scrollContainer);
  localPlacesInfo.push(...(await fillDataFromPage(page)));
  // await page.click("#eY4Fjd");
  // }

  await browser.close();

  return localPlacesInfo;
}

module.exports = { getLocalPlacesInfo };
