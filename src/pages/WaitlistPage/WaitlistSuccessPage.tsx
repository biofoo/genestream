// src/pages/WaitlistSuccessPage.tsx
const WaitlistSuccessPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="/icon-512x512.png"
            alt="GeneStream Icon"
            className="mx-auto my-16 h-32 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            You're In!
          </h2>
          <p className="mt-4 text-genestream-secondary">
            Thank you for joining our waitlist. We'll let you know as soon as
            your account is ready.
          </p>

          <div className="mt-16">
            <a
              href="https://www.genestream.com"
              className="text-genestream-primary hover:text-genestream-primary/90 font-medium"
            >
              Go to Ambryon.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSuccessPage;
