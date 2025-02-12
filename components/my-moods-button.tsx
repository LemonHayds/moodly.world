"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import Modal from "./modal";
import { useAuthUser } from "./providers/auth-provider/auth-client-provider";
import { fetchUserMoodLogs } from "../lib/utils/mood-log.utils";

const MyMoodButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthUser();
  const userId = user?.id;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="opacity-50 hover:opacity-100 hover:cursor-pointer transition-opacity duration-300 ease-in-out"
      >
        <Clock className="stroke-[1.5]" />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={<>Title</>}
        description={<>Description</>}
        setIsOpen={() => setIsModalOpen(!isModalOpen)}
        className="sm:max-w-[370px]"
        contents={<>Content</>}
      />
    </>
  );
};

export default MyMoodButton;
