"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ImageIcon, CheckCircle2, CircleCheckBig } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

// Image Carousel Dialog Component
export default function AiImageCarouselDialog({
  images,
  imageSearchStatus,
  onSelectionChange,
  initialSelectedIds = [],
}: {
  images: any[];
  imageSearchStatus: string;
  onSelectionChange: (imageIds: string[]) => void;
  initialSelectedIds?: string[];
}) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(
    new Set(initialSelectedIds)
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedImages));
    }
  }, [selectedImages, onSelectionChange]);

  const openImageCarousel = (index: number) => {
    setSelectedImageIndex(index);
    setCarouselOpen(true);
  };

  const toggleImageSelection = useCallback((imageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
        console.log("❌ Deselected Image ID:", imageId);
      } else {
        newSet.add(imageId);
        console.log("✅ Selected Image ID:", imageId);
      }
      return newSet;
    });
  }, []);

  // Clear selections when images change (optional)
  useEffect(() => {
    if (images.length > 0) {
      // Keep only selected IDs that still exist in the new images array
      const existingImageIds = new Set(images.map(img => img.imageId));
      setSelectedImages(prev => {
        const filtered = Array.from(prev).filter(id => existingImageIds.has(id));
        return new Set(filtered);
      });
    }
  }, [images]);

  // Listen to carousel selection changes
  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setSelectedImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  // Scroll to selected thumbnail when index changes (only when dialog is open)
  useEffect(() => {
    if (carouselApi && carouselOpen) {
      carouselApi.scrollTo(selectedImageIndex);
    }
  }, [selectedImageIndex, carouselApi, carouselOpen]);

  // Auto-open accordion when new images arrive
  useEffect(() => {
    if (images.length > 0) {
      setIsAccordionOpen(true);

      // Scroll to end of image list
      setTimeout(() => {
        const scrollContainer = document.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
          scrollContainer.scrollTo({
            left: scrollContainer.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [images.length]);

  // Reset carousel API when dialog closes
  useEffect(() => {
    if (!carouselOpen) {
      setCarouselApi(undefined);
    }
  }, [carouselOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full sm:w-[66vw] bg-white border rounded-md shadow-md">
        <Accordion
          type="single"
          collapsible
          value={isAccordionOpen ? "images" : ""}
          onValueChange={(value) => setIsAccordionOpen(value === "images")}
        >
          <AccordionItem value="images" className="border-none">
            <AccordionTrigger className="hover:no-underline px-2 justify-start gap-2 data-[state=open]:text-black-600 hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  Suggested Images ({images.length})
                  {selectedImages.size > 0 && (
                    <span className="ml-2 text-blue-600">
                      ({selectedImages.size} selected)
                    </span>
                  )}
                </span>
                {imageSearchStatus === "completed" && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    ✓ Ready
                  </span>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="py-2 px-2">
              <ScrollArea className="rounded-md border whitespace-nowrap p-2 bg-gray-50">
                <div ref={scrollRef} className="flex gap-2">
                  {images.map((img, index) => {
                    const isSelected = selectedImages.has(img.imageId);
                    return (
                      <div
                        key={img.imageId || index}
                        className="shrink-0 pb-2 overflow-hidden rounded-md group cursor-pointer transition-all relative"
                        onClick={() => openImageCarousel(index)}
                      >
                        <img
                          src={img.url}
                          alt={img.author || "Image"}
                          className={cn(
                            "w-48 h-40 object-cover rounded-lg",
                            isSelected
                              ? "border-3 border-[#F66435]"
                              : "hover:opacity-90"
                          )}
                        />
                        <p className="text-xs text-gray-500 mt-1 w-48 truncate">
                          Photo by {img.author} on {img.source}
                        </p>

                        {/* Selection checkbox/icon */}
                        <div
                          className="absolute top-2 right-2 z-10"
                          onClick={(e) =>
                            toggleImageSelection(img.imageId, e)
                          }
                        >
                          {isSelected ? (
                            <CircleCheckBig className="w-6 h-6 text-[#F66435] bg-transparent rounded-full" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-[#F66435] bg- rounded-full hover:bg-black/10 transition-colors" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {carouselOpen && (
        <Dialog open={carouselOpen} onOpenChange={setCarouselOpen}>
          <DialogContent className="max-w-4xl w-lg overflow-hidden bg-gray-100 backdrop-blur-sm border shadow-xl p-4">
            <DialogTitle className="sr-only">Image Carousel</DialogTitle>
            <div className="flex flex-col gap-2">
              <Carousel
                key={`carousel-${selectedImageIndex}`}
                className="max-w-md w-full ml-4"
                opts={{
                  startIndex: selectedImageIndex,
                  loop: false,
                }}
                setApi={setCarouselApi}
              >
                <CarouselContent>
                  {images.map((img) => {
                    const isSelected = selectedImages.has(img.imageId);
                    return (
                      <CarouselItem key={img.imageId}>
                        <div
                          className={cn(
                            "flex items-center justify-center min-h-[50vh] max-w-md w-full border my-4 p-2 rounded-xl bg-gray-200 shadow-md relative",
                            isSelected && "border-2 border-[#F66435]"
                          )}
                        >
                          <div className="flex items-center justify-center w-full h-full">
                            <img
                              src={img.url}
                              alt={img.author || "Image"}
                              className="max-w-full max-h-[50vh] object-contain rounded-lg"
                            />
                          </div>

                          {/* Selection checkbox/icon in carousel */}
                          <div
                            className="absolute bottom-6 right-6 z-10 cursor-pointer"
                            onClick={(e) =>
                              toggleImageSelection(img.imageId, e)
                            }
                          >
                            {isSelected ? (
                              <CircleCheckBig className="w-6 h-6 text-[#F66435] bg-transparent rounded-full" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-[#F66435] rounded-full hover:bg-black/50 transition-colors shadow-lg" />
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
                <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
              </Carousel>

              <div className="w-full overflow-hidden">
                <div className="text-sm font-medium text-gray-700 px-1 mb-1">
                  {selectedImageIndex + 1} of {images.length}
                  {selectedImages.size > 0 && (
                    <span className="ml-2 text-[#F66435]">
                      • {selectedImages.size} selected
                    </span>
                  )}
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pt-2 pb-3">
                    {images.map((img, index) => {
                      const isSelected = selectedImages.has(img.imageId);
                      return (
                        <div
                          key={img.imageId}
                          className={cn(
                            "shrink-0 overflow-hidden rounded-md cursor-pointer transition-all duration-200 border-2 relative",
                            selectedImageIndex === index
                              ? "border-gray-500 scale-105 shadow-md"
                              : "border-transparent hover:border-gray-300 hover:scale-102",
                            isSelected && "border-2 border-[#F66435]"
                          )}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={img.url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-20 h-16 object-cover rounded"
                          />

                          {/* Small selection indicator on thumbnails */}
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <CircleCheckBig className="w-4 h-4 text-[#F66435] bg-transparent rounded-full" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              <div className="px-2 text-sm text-gray-600">
                <p>
                  Photo by{" "}
                  {images[selectedImageIndex]?.author || "Unknown"} on{" "}
                  {images[selectedImageIndex]?.source || "Unknown"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}