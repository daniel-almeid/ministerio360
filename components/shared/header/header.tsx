"use client";

import { HeaderProfileMenu } from "./headerProfileMenu";
import { useHeaderData } from "./useHeaderData";

export function Header() {
  const { churchName, userEmail } = useHeaderData();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shadow-sm">

      <h2 className="hidden md:block text-xl font-semibold text-gray-800 tracking-tight"></h2>

      <div className="flex items-center gap-4 md:gap-5 ml-auto">
        <span className="text-gray-800 font-medium text-base hidden sm:block truncate max-w-[200px]">
          {churchName}
        </span>

        <HeaderProfileMenu churchName={churchName} userEmail={userEmail} />
      </div>
    </header>
  );
}
