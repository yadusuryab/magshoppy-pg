'use client'
import { useState, useEffect } from 'react';
import SelectPageComponent from './selectpage';
import { getAllShoes } from '@/lib/vehicleQueries';

interface SelectPageProps {
  shoes: any[];
}

export default function SelectPage() {
  const [shoes, setShoes] = useState<any>([]);

  useEffect(() => {
    const fetchShoes = async () => {
      const shoes = await getAllShoes();
      setShoes(shoes);
    };

    fetchShoes();
  }, []);

  return <SelectPageComponent shoes={shoes} />;
}
