"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries } from "countries-list";
import { useGeo } from "@/components/providers/geo-provider/geo-client-provider";

export function getCountryFlag(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const getCountryName = (code: string) => {
  return countryList.find((country) => country.value === code)?.label;
};

export const countryList = Object.entries(countries)
  .map(([code, country]) => ({
    value: code,
    label: country.name,
    native: country.native,
    phone: country.phone[0],
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const CountryPicker = (props: {
  showCountryName?: boolean;
  parentIsOpen?: boolean;
}) => {
  const { showCountryName = false, parentIsOpen = true } = props;

  const [open, setOpen] = useState(false);

  const { geoData, setGeoData } = useGeo();

  const [value, setValue] = useState(geoData.country);

  useEffect(() => {
    setGeoData({ ...geoData, country: value });
  }, [value]);

  // Close dropdown when parent container closes
  useEffect(() => {
    if (!parentIsOpen) {
      setOpen(false);
    }
  }, [parentIsOpen]);

  return (
    <Popover open={parentIsOpen ? open : false} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit justify-between bg-transparent border-none rounded-lg px-2"
        >
          {value ? (
            <span className="flex justify-center items-center gap-2">
              <div className="mr-0 text-2xl">{getCountryFlag(value)}</div>
              {showCountryName && (
                <div className="text-start w-[110px] truncate">
                  {
                    countryList.find((country) => country.value === value)
                      ?.label
                  }
                </div>
              )}
            </span>
          ) : (
            "Select country..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryList.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.value} ${country.label}`}
                  className="hover:cursor-pointer"
                  onSelect={(currentValue) => {
                    const code = currentValue.split(" ")[0];
                    setValue(code === value ? "" : code);
                    setOpen(false);
                  }}
                >
                  <span className="flex justify-center items-center gap-2">
                    <div className="mr-1 text-lg">
                      {getCountryFlag(country.value)}
                    </div>
                    {country.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryPicker;
