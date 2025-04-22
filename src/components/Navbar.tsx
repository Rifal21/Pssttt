'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function Navbar() {
    return (
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-6xl rounded-2xl bg-white/80 border border-gray-200 shadow-lg backdrop-blur-md px-4 md:px-6">
            <div className="flex justify-between items-center py-3">
                <Link href="/" className="text-xl font-bold text-pink-600">
                    Curhatin 😶‍🌫️
                </Link>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="gap-6">
                        <NavigationMenuItem>
                            <Link href="/" legacyBehavior passHref>
                                <NavigationMenuLink className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                                    Curhat Anonim
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/chat" legacyBehavior passHref>
                                <NavigationMenuLink className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                                    Chat Anonim
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger className="md:hidden text-gray-700">
                        <Menu size={24} />
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[75%] sm:w-[60%]">
                        <nav className="flex flex-col space-y-4 mt-10 px-4">
                            <Link href="/" className="text-lg font-medium text-gray-800 hover:text-pink-600">
                                Curhat Anonim
                            </Link>
                            <Link href="/chat" className="text-lg font-medium text-gray-800 hover:text-pink-600">
                                Chat Anonim
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
