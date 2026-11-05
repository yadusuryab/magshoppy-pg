import { Badge } from "./badge";

type Props = {
  imageUrl: string;
  caption: string;
  className?: string;
  price: any;
  ybg?: true;
  offerprice: any;
};

export default function ImageCard({
  imageUrl,
  caption,
  className = "",
  offerprice,
  price,
  ybg,
}: Props) {
  const savings = Math.round(((price - offerprice) / price) * 100);
  return (
    <figure
      className={`max-w-[300px] transition-transform transform group-hover:scale-110 overflow-hidden rounded-xl border  font-base shadow-shadow ${
        ybg ? "bg-secondary/30" : className
      }`}
    >
      <img className="w-full object-cover" src={imageUrl} alt="image" />
      {/* <figcaption className="text-sm text-foreground p-2"> */}
        {/* <span className="font-bold">{caption}</span> */}
       {/* <div className="md:flex gap-2 ">
       <span className="font-bold text-primary md:mr-0 mr-2">₹{offerprice}</span>
        <span className="font-bold text-secondary line-through ">
          ₹{price}
        </span>
        <Badge className="bg-blue-400 ">{savings}% OFF</Badge>
       </div> */}
      {/* </figcaption> */}
    </figure>
  );
}
