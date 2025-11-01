"use client";

import {redirect} from "next/navigation";

export default function adminIndexPage() {
  redirect("admin/login");
}
