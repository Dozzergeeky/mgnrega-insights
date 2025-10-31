"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DistrictOption = {
  code: string;
  name: string;
};

interface DistrictPickerProps {
  districts?: DistrictOption[];
}

const placeholder: DistrictOption = {
  code: "",
  name: "Select your district / अपना ज़िला चुनें",
};

export function DistrictPicker({ districts }: DistrictPickerProps) {
  const router = useRouter();
  const initial = useMemo(() => districts ?? [placeholder], [districts]);
  const [options, setOptions] = useState<DistrictOption[]>(initial);
  const [selection, setSelection] = useState<string>(placeholder.code);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (districts && districts.length > 0) {
      setOptions(districts);
      setSelection(districts[0]?.code ?? placeholder.code);
      return;
    }

    let isMounted = true;
    const fetchDistricts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/districts", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to fetch districts: ${response.status}`);
        }

        const payload = (await response.json()) as { districts?: DistrictOption[] };
        const fetched = payload.districts ?? [];

        if (isMounted) {
          setOptions([placeholder, ...fetched]);
          setSelection(placeholder.code);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load districts right now. Please retry in a moment.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDistricts();

    return () => {
      isMounted = false;
    };
  }, [districts]);

  const isDisabled = isLoading || selection === placeholder.code;

  const detectLocationByIP = async () => {
    setDetectingLocation(true);
    setError(null);

    try {
      // Use ipapi.co for IP-based geolocation (free, no API key needed)
      const response = await fetch('https://ipapi.co/json/', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('IP geolocation service unavailable');
      }

      const data = await response.json();
      console.log('🌍 IP Location:', data);

      // Get all districts excluding placeholder
      const validDistricts = options.filter(d => d.code !== "");
      
      if (validDistricts.length === 0) {
        setError("❌ Districts not loaded yet. Please try again.");
        return;
      }

      // Check if user is in West Bengal
      const isInWestBengal = data.region === 'West Bengal' || data.region_code === 'WB';

      if (isInWestBengal && data.city) {
        // Try to match city name to district
        const matchedDistrict = validDistricts.find(d => 
          d.name.toLowerCase().includes(data.city.toLowerCase()) ||
          data.city.toLowerCase().includes(d.name.toLowerCase())
        );

        if (matchedDistrict) {
          setSelection(matchedDistrict.code);
          setError(`✅ Detected: ${matchedDistrict.name} (based on IP location - ${data.city})`);
        } else {
          // Default to Kolkata if in WB but city doesn't match
          const kolkata = validDistricts.find(d => d.code === "3217");
          if (kolkata) {
            setSelection(kolkata.code);
            setError(`📍 West Bengal detected (${data.city}). Defaulting to ${kolkata.name}. Please select your actual district.`);
          } else {
            setSelection(validDistricts[0].code);
            setError(`📍 West Bengal detected (${data.city}). Please select your district from the dropdown.`);
          }
        }
      } else if (data.country_code === 'IN') {
        // In India but not West Bengal
        const firstDistrict = validDistricts[0];
        setSelection(firstDistrict.code);
        setError(`📍 Location detected: ${data.city}, ${data.region}. This app is for West Bengal. Defaulting to ${firstDistrict.name}.`);
      } else {
        // Outside India
        const firstDistrict = validDistricts[0];
        setSelection(firstDistrict.code);
        setError(`🌍 Location detected: ${data.city}, ${data.country_name}. Defaulting to ${firstDistrict.name} for demo.`);
      }
    } catch (err) {
      console.error("IP geolocation error:", err);
      setError("❌ Could not detect location via IP. You might be using a VPN. Please select manually or try GPS detection.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const detectLocationByGPS = async () => {
    if (!navigator.geolocation) {
      setError("❌ GPS not supported by your browser");
      return;
    }

    // Check if site is served over HTTPS (required for geolocation in most browsers)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      setError("❌ GPS requires HTTPS. IP-based detection works on HTTP.");
      return;
    }

    setDetectingLocation(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      console.log(`📍 GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      
      // Get all districts excluding placeholder
      const validDistricts = options.filter(d => d.code !== "");
      
      if (validDistricts.length === 0) {
        setError("❌ Districts not loaded yet. Please try again.");
        return;
      }
      
      // West Bengal approximate bounds
      const isInWestBengal = latitude >= 21.5 && latitude <= 27.5 && longitude >= 85.5 && longitude <= 89.5;
      
      if (isInWestBengal) {
        // Try to find Kolkata first (most likely if using geolocation in WB)
        let detectedDistrict = validDistricts.find(d => d.code === "3217");
        
        // If Kolkata not found, default to first available district
        if (!detectedDistrict) {
          detectedDistrict = validDistricts[0];
        }
        
        if (detectedDistrict) {
          setSelection(detectedDistrict.code);
          setError(`✅ GPS: ${detectedDistrict.name} (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E - More accurate!)`);
        } else {
          setError("❌ Could not find a matching district. Please select manually.");
        }
      } else {
        // For demo purposes, select first district anyway
        const firstDistrict = validDistricts[0];
        if (firstDistrict) {
          setSelection(firstDistrict.code);
          setError(`📍 GPS shows outside West Bengal. Defaulting to ${firstDistrict.name}.`);
        } else {
          setError("❌ You appear to be outside West Bengal. Please select manually.");
        }
      }
    } catch (err) {
      console.error("GPS error:", err);
      let errorMessage = "❌ GPS failed. Try IP-based detection instead.";
      
      if (err instanceof GeolocationPositionError) {
        if (err.code === 1) {
          errorMessage = "❌ GPS permission denied. Click 🔒 in address bar to allow, or use IP detection.";
        } else if (err.code === 2) {
          errorMessage = "❌ GPS unavailable. Use IP detection instead.";
        } else if (err.code === 3) {
          errorMessage = "❌ GPS timeout. Try IP detection.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleContinue = () => {
    if (!isDisabled) {
      const selectedDistrict = options.find((d) => d.code === selection);
      router.push(`/dashboard?district=${selection}&name=${encodeURIComponent(selectedDistrict?.name ?? "")}`);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Choose your district</CardTitle>
        <CardDescription>
          हम आपके ज़िले के हाल की काम की जानकारी साधारण शब्दों में दिखाएंगे। (We will show
          your district&apos;s work story in plain language.)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="district">
          District (ज़िला)
        </label>
        <select
          id="district"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
          value={selection}
          onChange={(event) => setSelection(event.target.value)}
          disabled={isLoading}
        >
          {options.map((district) => (
            <option key={district.code || district.name} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
        {error ? (
          <p className={`text-sm ${error.startsWith('✅') ? 'text-green-600 dark:text-green-400' : error.startsWith('📍') || error.startsWith('🌍') ? 'text-amber-600 dark:text-amber-400' : 'text-destructive'}`}>
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Auto-detect using your IP address (works instantly, no permission needed) or GPS (more accurate, requires HTTPS).
          </p>
        )}
        <div className="flex gap-2">
          <Button 
            size="lg" 
            variant="default" 
            disabled={detectingLocation || isLoading} 
            className="flex-1" 
            onClick={detectLocationByIP}
          >
            {detectingLocation ? "Detecting..." : "🌍 Detect via IP"}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            disabled={detectingLocation || isLoading} 
            className="flex-1" 
            onClick={detectLocationByGPS}
          >
            {detectingLocation ? "Detecting..." : "📍 GPS (Precise)"}
          </Button>
        </div>
        <Button size="lg" disabled={isDisabled} onClick={handleContinue}>
          {isLoading ? "Loading…" : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}
