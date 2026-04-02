import { CreateSessionForm } from '@/src/features/create-session';

export function SessionCreatePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">🍽️ Lunchy</h1>
          <p className="text-[#6B7280]">セッションを作成してチームを招待しましょう</p>
        </div>
        <CreateSessionForm />
      </div>
    </main>
  );
}
