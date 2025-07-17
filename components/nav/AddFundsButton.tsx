"use client";

import { Button } from "../ui/button";

export default function AddFundsButton() {
  const handleAddFunds = async () => {
    const res = await fetch("/api/funds", {
      method: "POST",
    });

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    }
  };

  return <Button onClick={handleAddFunds}>Add Funds</Button>;
}
