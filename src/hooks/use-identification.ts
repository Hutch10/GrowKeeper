import { useState, useCallback } from "react";
import { SpecimenIdentificationResult } from "@/lib/services/specimen-identification";

export function useIdentification() {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identify = useCallback(async (imageFile: File): Promise<SpecimenIdentificationResult | null> => {
    setIsIdentifying(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(imageFile);
      const base64Image = await base64Promise;

      const response = await fetch("/api/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to identify specimen");
      }

      const result = await response.json();
      return result as SpecimenIdentificationResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Identification failed";
      setError(msg);
      return null;
    } finally {
      setIsIdentifying(false);
    }
  }, []);

  return {
    identify,
    isIdentifying,
    error,
  };
}
