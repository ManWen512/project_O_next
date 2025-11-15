"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function ImageCarousel({ postImages }: { postImages?: string[] }) {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <div>
      {/* Small preview grid */}
      <ScrollArea className="">
        <div className="flex w-max space-x-4 p-4">
          {postImages?.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`Image ${index + 1}`}
              width={300}
              height={300}
              className="rounded-lg cursor-pointer object-cover"
              onClick={() => {
                setSelectedIndex(index);
                setOpen(true);
              }}
            />
          ))}
        </div>
           <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Dialog Carousel when clicked */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Image Carousel</DialogTitle>
          <Carousel
            className="w-full"
            opts={{
              startIndex: selectedIndex,
              loop: false,
            }}
          >
            <CarouselContent>
              {postImages?.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center">
                    <Image
                      src={src}
                      alt={`Full Image ${index + 1}`}
                      width={800}
                      height={800}
                      className="rounded-lg object-contain p-2"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="sm:visible invisible" />
            <CarouselNext className="sm:visible invisible" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}
