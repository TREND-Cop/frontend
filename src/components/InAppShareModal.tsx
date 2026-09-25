import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Linking,
  Share,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Check } from 'lucide-react-native';
import { SafeImage } from './ui/SafeImage';
import { useShareStore } from '../utils/shareStore';

// ── Figma Vector Icons ──
const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6L18 18M6 18L18 6"
      stroke="#141B34"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CopyIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="9" width="11" height="11" rx="2.5" stroke="#141B34" strokeWidth={1.5} />
    <Path
      d="M15 9V6C15 4.89543 14.1046 4 13 4H6C4.89543 4 4 4.89543 4 6V13C4 14.1046 4.89543 15 6 15H9"
      stroke="#141B34"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// ── Social Media Channels ──
const SOCIALS = [
  {
    id: 'whatsapp',
    name: 'Whatsapp',
    icon: require('../../assets/images/socials/whatsapp.png'),
    getUrl: (url: string, title: string) =>
      `whatsapp://send?text=${encodeURIComponent(`Check out ${title} on Trend: ${url}`)}`,
    fallback: (url: string, title: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${title} on Trend: ${url}`)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: require('../../assets/images/socials/facebook.png'),
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'tiktok',
    name: 'Tiktok',
    icon: require('../../assets/images/socials/tiktok.png'),
    getUrl: () => `snssdk1233://`,
    fallback: () => `https://www.tiktok.com`,
  },
  {
    id: 'instagram',
    name: 'instagram',
    icon: require('../../assets/images/socials/instagram.png'),
    getUrl: () => `instagram://app`,
    fallback: () => `https://www.instagram.com`,
  },
];

interface InAppShareModalProps {
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  status?: string;
  statusColor?: string;
  url?: string;
  avatar?: any;
}

export const InAppShareModal: React.FC<InAppShareModalProps> = ({
  visible: propVisible,
  onClose: propOnClose,
  title: propTitle,
  status: propStatus,
  statusColor: propStatusColor,
  url: propUrl,
  avatar: propAvatar,
}) => {
  const store = useShareStore();

  const isVisible = propVisible !== undefined ? propVisible : store.isOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    store.closeShare();
  };

  const title = propTitle || store.options.title || 'Beauty in white salon';
  const status = propStatus || store.options.status || 'Closed';
  const statusColor = propStatusColor || store.options.statusColor || 'rgba(204, 41, 41, 0.9)';
  const url = propUrl || store.options.url || 'https://pin.it/1n5aDO4QX';
  const avatar = propAvatar || store.options.avatar || require('../../assets/images/profile/882a99380ae2d750b39f897365bd1d6083664a3b.jpg');

  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.log('Copy error:', err);
    }
  };

  const handleSocialClick = async (social: (typeof SOCIALS)[0]) => {
    try {
      const shareUrl = social.getUrl(url, title);
      if (Platform.OS === 'web') {
        const webUrl = social.fallback ? social.fallback(url, title) : shareUrl;
        if (typeof window !== 'undefined') {
          window.open(webUrl, '_blank');
        } else {
          await Linking.openURL(webUrl);
        }
        return;
      }
      const supported = await Linking.canOpenURL(shareUrl);
      if (supported) {
        await Linking.openURL(shareUrl);
      } else if (social.fallback) {
        await Linking.openURL(social.fallback(url, title));
      } else {
        await Share.share({
          message: `${title}: ${url}`,
          url: url,
        });
      }
    } catch (err) {
      console.log('Social share error:', err);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.sheetContainer}>
          {/* ── Header: Title & Close Button ── */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Share with</Text>

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.7}
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* ── Socials Row (Whatsapp, Facebook, Tiktok, Instagram) ── */}
          <View style={styles.socialsRow}>
            {SOCIALS.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={styles.socialItem}
                activeOpacity={0.8}
                onPress={() => handleSocialClick(social)}
              >
                <SafeImage
                  source={social.icon}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialLabel}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Divider Line ── */}
          <View style={styles.dividerLine} />

          {/* ── Copy Link Section ── */}
          <View style={styles.copySection}>
            <View style={styles.copyLabelRow}>
              <Text style={styles.copyLabel}>Copy Link</Text>
              {copied && (
                <View style={styles.copiedFeedback}>
                  <Check size={12} color="#0C790C" strokeWidth={2.5} />
                  <Text style={styles.copiedFeedbackText}>Copied</Text>
                </View>
              )}
            </View>

            <View style={styles.linkContainer}>
              <Text
                style={styles.linkText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {url}
              </Text>

              <TouchableOpacity
                style={styles.copyButton}
                activeOpacity={0.7}
                onPress={handleCopyLink}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {copied ? (
                  <Check size={20} color="#0C790C" strokeWidth={2.5} />
                ) : (
                  <CopyIcon />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Entity Preview Row (Bottom: Avatar + Title + Status) ── */}
          <View style={styles.entityRow}>
            <SafeImage
              source={avatar}
              style={styles.entityAvatar}
              resizeMode="cover"
            />

            <View style={styles.entityInfo}>
              <Text style={styles.entityTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[styles.entityStatus, { color: statusColor }]}>
                {status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 8, 20, 0.45)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
      },
    }),
  },
  backdropTouch: {
    flex: 1,
    width: '100%',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 20,
    shadowColor: 'rgba(0, 8, 20, 0.15)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // ── Header Row ──
  headerRow: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.2,
    color: '#000000',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 4,
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Socials Row ──
  socialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    height: 72,
  },
  socialItem: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  socialLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: '#000000',
    textAlign: 'center',
  },

  // ── Divider ──
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(235, 235, 245, 0.96)',
  },

  // ── Copy Link Section ──
  copySection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  copyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
  },
  copiedFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(207, 237, 207, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  copiedFeedbackText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
    color: '#0C790C',
  },
  linkContainer: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_500Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#000000',
  },
  copyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Entity Preview Row ──
  entityRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingTop: 4,
  },
  entityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 247, 247, 0.96)',
  },
  entityInfo: {
    flex: 1,
    gap: 2,
  },
  entityTitle: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#000000',
  },
  entityStatus: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'DMSans_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});

export default InAppShareModal;
