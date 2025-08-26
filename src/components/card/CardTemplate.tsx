import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface CardTemplateProps {
  name: string;
  position: string;
  department: string;
  employeeId: string;
  photo?: string;
  issueDate: string;
}

export function CardTemplate({ 
  name, 
  position, 
  department, 
  employeeId, 
  photo, 
  issueDate 
}: CardTemplateProps) {
  return (
    <Card className="w-80 h-48 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90" />
      
      <div className="relative p-6 h-full flex">
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-blue-100 text-sm">{position}</p>
            <p className="text-blue-100 text-sm">{department}</p>
          </div>
          
          <div className="mt-auto">
            <p className="text-xs text-blue-200">ID: {employeeId}</p>
            <p className="text-xs text-blue-200">발급일: {issueDate}</p>
          </div>
        </div>
        
        <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center ml-4">
          {photo ? (
            <ImageWithFallback 
              src={photo} 
              alt={`${name} 사진`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-white/60 text-xs text-center">사진</div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 text-xs text-blue-200">
        회사명
      </div>
    </Card>
  );
}