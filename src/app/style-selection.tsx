/**
 * Route: /style-selection -> redirected to /appointment-specialist
 */

import { Redirect } from 'expo-router';

export default function StyleSelectionRoute() {
  return <Redirect href="/appointment-specialist" />;
}
