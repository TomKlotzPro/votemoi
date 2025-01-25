import { useUrls } from '@/app/hooks/useUrls';
import { fr } from '@/app/translations/fr';
import UrlList from './UrlList';

type UrlManagerProps = {
  onUrlSelect?: (url: { id: string; url: string; title?: string }) => void;
  selectedUrlId?: string;
};

export default function UrlManager({
  onUrlSelect,
  selectedUrlId,
}: UrlManagerProps) {
  const { loading, error } = useUrls();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{fr.titles.urlManager}</h1>
      <UrlList onUrlSelect={onUrlSelect} selectedUrlId={selectedUrlId} />
    </div>
  );
}
