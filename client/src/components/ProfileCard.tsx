import { Cancel, CheckCircle, OpenInNew } from "@mui/icons-material";
import { Card } from "./Card";

export function ProfileCard({ url, text }: { url: string; text: string }) {
  return (
    <Card elevated={true}>
      {url ? (
        <div className="flex space-x-2 items-center">
          <CheckCircle color="inherit" className="text-green-600"></CheckCircle>
          <p className="text-lg">{text}</p>
          <a
            href={url}
            className="text-blue-500 underline flex items-center space-x-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNew color="inherit" fontSize="inherit"></OpenInNew>
          </a>
        </div>
      ) : (
        <div className="flex space-x-2 items-center">
          <Cancel color="inherit" className="text-red-600"></Cancel>
          <p className="text-lg">{text}</p>
        </div>
      )}
    </Card>
  );
}
