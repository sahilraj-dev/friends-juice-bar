'use client';

import useSWR from 'swr';
import { Star } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReviewsPage() {
  const { data: reviews, error } = useSWR('/api/vendor/reviews', fetcher);

  if (error) return <div className="p-6">Error loading reviews.</div>;
  if (!reviews) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h1>
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-medium text-gray-900">{review.customerName}</div>
                <div className="text-sm text-gray-500">Order #{review.orderNumber} • {new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg border border-gray-200 text-gray-500">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
