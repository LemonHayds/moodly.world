"use server";

import CurrentCountryFlag from "./current-country-flag";

export default async function Footer() {
  return (
    <footer className="z-[10] py-7 xs:py-8 px-10 fixed left-0 bottom-0 w-full flex items-end justify-between min-w-screen font-semibold pointer-events-none">
      <a
        href="https://sherwoods.dev"
        target="_blank"
        className="select-none absolute left-1/2 -translate-x-1/2 font-normal text-center bottom-[15px] opacity-25 hover:opacity-100 transition-opacity duration-300 pointer-events-auto hover:cursor-pointer"
      >
        sherwoods.dev
      </a>
      <CurrentCountryFlag />
    </footer>
  );
}
