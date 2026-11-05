"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface SearchBarProps {
  defaultValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ defaultValue = "" }) => {
  const [search, setSearch] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  useEffect(() => setSearch(defaultValue), [defaultValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/products?search=${search}`);
    }
  };

  return (
    <div>
      <div
        className={`flex h-12 w-full md:min-w-96 justify-between items-center rounded-full   font-base selection:bg-primary selection:text-mtext  bg-background border px-2 py-2 text-sm transition-all ${
          isFocused ? "ring-1 ring-ring" : ""
        }`}
      >
        <input
          placeholder="Search Trendy Shoes."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="border-0 outline-none w-full  px-3 py-2 rounded-full"
        />
        <Link href={search ? `/products?search=${search}` : "/products"}>
          <Button >
            <Search /> Search
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SearchBar;
