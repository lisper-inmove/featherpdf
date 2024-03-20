"use client";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { linkHome, linkPricing } from "@/constants/link-href";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const { user } = useKindeBrowserClient();

  return (
    <nav className="sticky h-14 inset-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href={linkHome} className="flex z-40 font-semibold">
            <span>featherpdf.</span>
          </Link>
          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                href={linkPricing}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Pricing
              </Link>
              {user ? (
                <p>{user.email}</p>
              ) : (
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign in
                </LoginLink>
              )}
              {user ? (
                <LogoutLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign out
                </LogoutLink>
              ) : null}
              {!user ? (
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Register{" "}
                  <ArrowRight className="ml-1.5 h-5 w-5 text-sm"></ArrowRight>
                </RegisterLink>
              ) : null}
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
