import { useEffect } from "react";
import Tour from "reactour";
import { useUser } from "@clerk/clerk-react";
import { useTour } from "../context/TourContext";

interface DashboardTourProps {
  children: React.ReactNode;
}

const DashboardTour = ({ children }: DashboardTourProps) => {
  const { user } = useUser();
  const { isTourOpen, openTour, closeTour } = useTour();

  // Check if we should show the tour on mount
  useEffect(() => {
    if (user?.lastSignInAt) {
      const lastSignInTime = new Date(user.lastSignInAt).getTime();
      const lastTourTime = localStorage.getItem("lastTourTime");
      
      // Show tour if this is a new sign in (lastTourTime is before lastSignInTime)
      if (!lastTourTime || new Date(lastTourTime).getTime() < lastSignInTime) {
        openTour();
        // Update the last tour time
        localStorage.setItem("lastTourTime", new Date().toISOString());
      }
    }
  }, [user, openTour]);

  const steps = [
    {
      selector: '.tour-logo',
      content: "Welcome to HealthMate! Your personalized AI-powered health companion that helps you track, manage, and improve your health journey.",
    },
    {
      selector: '.tour-dashboard',
      content: "This is your Dashboard Overview - get a quick snapshot of your health metrics, upcoming appointments, and daily goals all in one place.",
    },
    {
      selector: '[href="/dashboard/userinfo"]',
      content: "Manage your comprehensive health profile here. Keep your medical history, allergies, and medications up to date for personalized care.",
    },
    {
      selector: '[href="/dashboard/appointments"]',
      content: "Schedule and manage your medical appointments. View upcoming consultations and get reminders for your next check-up.",
    },
    {
      selector: '.tour-goals',
      content: "Set and track your health goals. Whether it's fitness, nutrition, or mental wellness, monitor your progress and stay motivated.",
    },
    {
      selector: '[href="/dashboard/reports"]',
      content: "Access your health reports and medical documents. View test results, prescriptions, and track your health trends over time.",
    },
    {
      selector: '.tour-ai-assistant',
      content: "Meet your AI Health Assistant! Get instant answers to health questions, personalized wellness tips, and 24/7 support.",
    },
    {
      selector: '.tour-profile',
      content: "Access your profile settings, customize your preferences, and manage your account details here.",
    }
  ];

  return (
    <>
      {isTourOpen && (
        <Tour
          steps={steps}
          isOpen={isTourOpen}
          onRequestClose={closeTour}
          rounded={8}
          accentColor="#4F46E5"
          nextButton={
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              Next →
            </button>
          }
          prevButton={
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              ← Prev
            </button>
          }
          closeButton={
            <button
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={closeTour}
            >
              ✕
            </button>
          }
          lastStepNextButton={
            <button
              onClick={closeTour}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Finish Tour
            </button>
          }
          customComponents={{
            Navigation: ({ currentStep, stepsLength }) => (
              <div className="mt-4 text-center text-sm text-gray-500">
                Step {currentStep + 1} of {stepsLength}
              </div>
            ),
          }}
          styles={{
            options: {
              backgroundColor: user?.publicMetadata?.darkMode ? "#1F2937" : "#FFFFFF",
              textColor: user?.publicMetadata?.darkMode ? "#F3F4F6" : "#1F2937",
              arrowColor: "#4F46E5",
              overlayColor: "rgba(0, 0, 0, 0.5)",
              width: 350,
              zIndex: 1000,
            },
            tooltipContainer: {
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            tooltipContent: {
              padding: "10px 0",
              fontSize: "14px",
              lineHeight: "1.5",
            },
          }}
        />
      )}
      {children}
    </>
  );
};

export default DashboardTour;
