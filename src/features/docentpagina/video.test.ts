import { describe, expect, it } from "vitest";

import { videoAdres } from "./video";

/**
 * Een docent typt hier zelf een adres in. Dat is het enige veld op zijn pagina
 * waar iets van buiten binnenkomt, dus het is ook de enige plek waar een
 * ongeluk kan gebeuren.
 */
describe("videoAdres", () => {
  it("zet een gewone YouTube-link om naar de variant zonder cookies", () => {
    expect(videoAdres("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123",
    );
  });

  it("begrijpt een verkorte youtu.be-link", () => {
    expect(videoAdres("https://youtu.be/abc123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123",
    );
  });

  it("zet een Vimeo-link om", () => {
    expect(videoAdres("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    );
  });

  it("weigert elke andere aanbieder", () => {
    // Niet uit smaak: de Content-Security-Policy laat alleen die twee hosts
    // toe, dus alles hier zou een leeg vak worden.
    expect(videoAdres("https://vimeo.com.kwaadwillend.nl/123")).toBeNull();
    expect(videoAdres("https://dailymotion.com/video/x123")).toBeNull();
    expect(videoAdres("https://mijnsite.nl/film.mp4")).toBeNull();
  });

  it("weigert http en rare invoer", () => {
    expect(videoAdres("http://www.youtube.com/watch?v=abc")).toBeNull();
    expect(videoAdres("javascript:alert(1)")).toBeNull();
    expect(videoAdres("gewoon wat tekst")).toBeNull();
    expect(videoAdres("")).toBeNull();
  });

  it("weigert een Vimeo-adres zonder nummer", () => {
    expect(videoAdres("https://vimeo.com/kanaal/naam")).toBeNull();
  });
});
