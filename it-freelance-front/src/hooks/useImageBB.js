import { useCallback, useState } from "react";
import axios from "axios";

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

export default function useImageBB() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const reset = useCallback(() => {
    setUploading(false);
    setError("");
    setUrl("");
  }, []);

  const upload = useCallback(async (file) => {
    setError("");

    const apiKey = process.env.REACT_APP_IMGBB_KEY;
    if (!apiKey) {
      const msg = "Nedostaje REACT_APP_IMGBB_KEY u .env fajlu.";
      setError(msg);
      throw new Error(msg);
    }

    if (!file) {
      const msg = "Nisi izabrala sliku.";
      setError(msg);
      throw new Error(msg);
    }

    // Opciona zaštita (imgbb ima limit; bezbedno je da ograničiš npr. na 10MB).
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      const msg = "Slika je prevelika. Probaj manju (do 10MB).";
      setError(msg);
      throw new Error(msg);
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file, file.name);

      // BITNO: ne setuj ručno Content-Type. Axios će sam dodati boundary.
      const res = await axios.post(
        `${IMGBB_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
        formData
      );

      const imgUrl =
        res?.data?.data?.url ||
        res?.data?.data?.display_url ||
        res?.data?.data?.image?.url ||
        "";

      if (!imgUrl) {
        const msg = "Upload je uspeo, ali nije vraćen URL slike.";
        setError(msg);
        throw new Error(msg);
      }

      setUrl(imgUrl);
      return imgUrl;
    } catch (e) {
      const serverMsg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        "Greška pri upload-u na imgbb.";
      setError(serverMsg);
      throw e;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, error, url, reset, setUrl };
}
