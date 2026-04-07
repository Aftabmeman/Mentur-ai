import { redirect } from 'next/navigation';

export default function DeprecatedAssessmentsPage() {
  redirect('/dashboard/assessments');
}
