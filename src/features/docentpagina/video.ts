/**
 * Zet een YouTube- of Vimeo-adres om naar de insluitvorm zonder cookies.
 *
 * Alles wat niet van die twee is levert `null` op en wordt niet getoond. Dat is
 * geen extra voorzichtigheid maar noodzaak: de Content-Security-Policy staat in
 * `frame-src` alleen `youtube-nocookie.com` en `player.vimeo.com` toe. Een
 * ander adres zou dus toch een leeg vak opleveren — en dan liever niets dan een
 * gat waar een docent naar staat te kijken zonder te snappen waarom.
 *
 * Het staat los van de component zodat het te testen is zonder React erbij te
 * halen; deze functie is de enige plek waar een door een docent ingetypt adres
 * de pagina in komt.
 */
export function videoAdres(url: string): string | null {
  if (!url) return null;

  try {
    const adres = new URL(url.trim());

    // Alleen https. Een http-insluiting wordt door de browser toch geweigerd
    // op een pagina die `upgrade-insecure-requests` meestuurt.
    if (adres.protocol !== "https:") return null;

    const host = adres.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = adres.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id = adres.searchParams.get("v") ?? adres.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = adres.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id)
        ? `https://player.vimeo.com/video/${id}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}
