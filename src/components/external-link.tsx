import { Href } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { SafeLink, useSingleFlight } from '../utils/safeNavigation';

type Props = Omit<ComponentProps<typeof SafeLink>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  const handlePress = useSingleFlight(async (event: any) => {
    if (process.env.EXPO_OS !== 'web') {
      // Prevent the default behavior of linking to the default browser on native.
      event.preventDefault();
      // Open the link in an in-app browser.
      await openBrowserAsync(href, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    }
  });

  return (
    <SafeLink
      target="_blank"
      {...rest}
      href={href}
      onPress={handlePress}
    />
  );
}
