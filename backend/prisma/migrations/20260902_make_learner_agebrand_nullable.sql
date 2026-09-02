-- Allow Learner.ageBand to be null at registration time.
-- Age band is now collected during the first-time onboarding flow
-- (WelcomePage -> AgeSelectPage -> PATCH /auth/me/age-band) instead of
-- at signup, so the column can no longer be required NOT NULL.
ALTER TABLE "learners" ALTER COLUMN "ageBand" DROP NOT NULL;
