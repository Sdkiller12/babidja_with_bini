import Messenger from '@/components/Messenger';

export default function CustomerMessagingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Contactez directement les gérants pour vos réservations.</p>
      </div>
      <Messenger isPro={false} />
    </div>
  );
}
