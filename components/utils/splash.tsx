import React from "react";
import Brand from "../brand/brand";

function Splash() {
  return (
    <div className="fixed inset-0 flex flex-col items-center  justify-center bg-background z-50">
      <div className="flex items-center gap-2">
        <Brand />
      </div>
    </div>
  );
}

export default Splash;
