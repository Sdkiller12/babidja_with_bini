import Messenger from '@/components/Messenger';

export default function RestaurantMessagingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Messagerie Clientèle</h1>
        <p className="text-sm text-gray-500 mt-1">Communiquez directement avec vos clients concernant leurs réservations de table.</p>
      </div>
      <Messenger isPro={true} />
    </div>
  );
}
