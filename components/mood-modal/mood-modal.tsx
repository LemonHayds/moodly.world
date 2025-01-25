"use client";

import Modal from "../modal";
import { useGlobeAnalytics } from "../providers/globe-analytics-provider/globe-analytics-client-provider";
import { getCountryFlag, getCountryName } from "../ui/country-picker";
import MoodBarChart from "./parts/mood-bar-chart";

const MoodModal = () => {
  const { isModalOpen, setIsModalOpen, selectedCountry, activeFilter } =
    useGlobeAnalytics();

  return (
    <Modal
      isOpen={isModalOpen}
      title={
        <div className="leading-[1.35] -mt-1">
          Mood distribution in the last{" "}
          {activeFilter === "1hr"
            ? "hour"
            : activeFilter === "24hr"
            ? "24 hours"
            : activeFilter}
        </div>
      }
      description={
        <span className="leading-[1.35] flex items-center gap-2">
          <span className="text-xl">
            {getCountryFlag(selectedCountry || " ")}
          </span>
          <span className="text-[17px]">
            {getCountryName(selectedCountry || " ")}
          </span>
        </span>
      }
      setIsOpen={() => setIsModalOpen(!isModalOpen)}
      className="sm:max-w-[370px]"
      contents={<MoodBarChart />}
    />
  );
};

export default MoodModal;
