"use client";
import React, { Suspense, useEffect, useState } from "react";
 // Updated component name
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

 // Updated function names
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { site } from "@/lib/site-config";
import { getAllShoes} from "@/lib/vehicleQueries";
import Loading from "@/components/utils/loading";
import SHeading from "@/components/utils/section-heading";
import ProductCard from "@/components/product/product-card";

function ProductList() {
  const [shoes, setShoes] = useState<any[]>([]);
  const [filteredShoes, setFilteredShoes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search");

  // Fetch all shoes initially
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const shoesData: any = await getAllShoes();
        setShoes(shoesData);
        setFilteredShoes(shoesData);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle search updates
  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setFilteredShoes(shoes);
    }
  }, [searchTerm, shoes]);

  // Function to search products
  const handleSearch = async (keyword: string) => {
    setSearchLoading(true);
    
  };

  if (loading) return <Loading />;
  if (error) return toast("Please refresh the page.");

  return (
    <div>
      <div className="md:mx-28 mx-4">
        <SHeading title="Explore Our Shoe Collection." description="Check out Instagram Profile" buttonText="Visit Instagram" linkHref={`https://instagram.com/${site.instagram}`} />

        {searchLoading && <Loading />} {/* Show loader when searching */}

        {!searchLoading && filteredShoes.length === 0 ? (
          <div className="flex flex-col justify-center max-w-96 mx-auto space-y-4">
            <p className="text-center text-lg text-muted-foreground font-bold mt-6">
              Couldn't find what you're looking for? Contact us via WhatsApp.
            </p>
            <Link href={`https://wa.me/${site.phone}?text=${encodeURIComponent("Hi")}`} target="_blank">
              <div className="flex justify-center">
                <Button className="mx-auto bg-green-500 text-white hover:bg-green-600">
                  Chat via WhatsApp
                </Button>
              </div>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mt-6">
            {filteredShoes.map((shoe) => (
              <ProductCard key={shoe._id} product={shoe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  );
}
