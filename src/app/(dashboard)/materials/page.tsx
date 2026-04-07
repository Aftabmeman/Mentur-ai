import { redirect } from 'next/navigation';

export default function DeprecatedMaterialsPage() {
  redirect('/dashboard/materials');
}
