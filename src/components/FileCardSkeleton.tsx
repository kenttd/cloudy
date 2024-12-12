import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FileCardSkeleton() {
  return (
    <>
      {[...Array(20)].map((_, index) => (
        <Card className="group" key={index}>
          <CardContent className="flex flex-col items-center justify-center gap-2 p-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="text-center">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-center gap-2 bg-muted p-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
