import { useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Deck from './src/deck/Deck';
import { DeckSpec } from './src/reel-physics/reelPhysics';
import { useNowPlaying } from './src/now-playing/useNowPlaying';
import { createMockSource } from './src/now-playing/mockSource';
import { createSpotifySource } from './src/now-playing/spotifySource';
import { useSpotifyAuth } from './src/spotify/useSpotifyAuth';
import { useWebPlayback } from './src/spotify/useWebPlayback';
import { useTape } from './src/tape-curation/useTape';
import { totalDuration } from './src/tape-curation/tape';
import TapeEditor from './src/tape-curation/TapeEditor';
import { MOCK_CATALOG } from './src/catalog/mockCatalog';
import { colors, layout, motion, radius, spacing } from './src/theme/tokens';

const SPEC: DeckSpec = { hubRadius: 72, maxRadius: 150 };

const previewSeconds = (totalSec: number): number =>
  totalSec === 0 ? 30 : Math.max(10, Math.min(90, totalSec / 8));

const focusRing = (color: string) =>
  Platform.select({
    web: {
      outlineStyle: 'solid' as const,
      outlineWidth: 2,
      outlineColor: color,
      outlineOffset: 2,
    },
    default: {},
  });

export default function App() {
  const { width } = useWindowDimensions();
  const { tape, add, remove, full } = useTape();
  const auth = useSpotifyAuth();
  const web = Platform.OS === 'web';
  const wp = useWebPlayback(auth.isAuthed, auth.getAccessToken);
  const [editing, setEditing] = useState(false);

  const source = useMemo(() => {
    if (auth.isAuthed && web && wp.ready) return wp.source;
    if (auth.isAuthed) return createSpotifySource(auth.getAccessToken);
    return createMockSource(previewSeconds(totalDuration(tape)));
  }, [auth.isAuthed, web, wp.ready, wp.source, auth.getAccessToken, tape]);

  const { state, toggle } = useNowPlaying(source, SPEC, wp.ready ? 400 : 2000);

  const onTogglePlay = () => (wp.ready ? wp.controls.toggle() : toggle());

  const deckWidth = Math.min(width - spacing.frameX * 2, layout.deckMax);
  const loaded = tape.tracks.length > 0;
  const playLabel = state.isPlaying ? '❚❚ PAUSE' : '▶ PLAY';

  const nowPlayingLabel =
    state.trackArtist && state.trackTitle
      ? `${state.trackArtist} - ${state.trackTitle}`
      : loaded
      ? `${tape.tracks[0].artist} - ${tape.tracks[0].title}`
      : '—';

  return (
    <View style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.headerRow}>
          <Text style={styles.deckId} numberOfLines={1} accessibilityRole="header">
            {nowPlayingLabel}
          </Text>
          <Pressable
            onPress={onTogglePlay}
            style={({ pressed, focused }) => [
              styles.playControl,
              pressed && styles.pressed,
              focused && focusRing(colors.accentYellow),
            ]}
            accessibilityRole="button"
            accessibilityLabel={state.isPlaying ? 'Pause' : 'Play'}
          >
            <Text style={styles.state}>{playLabel}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onTogglePlay}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Toggle playback"
        >
          <Deck
            width={deckWidth}
            spec={SPEC}
            progress={state.progress}
            supplyAngle={state.supplyAngle}
            takeupAngle={state.takeupAngle}
          />
        </Pressable>

        <View style={styles.buttonsRow}>
          {auth.isAuthed ? (
            <Pressable
              style={({ pressed, focused }) => [
                styles.ghostBtn,
                pressed && styles.pressed,
                focused && focusRing(colors.serviceSpotify),
              ]}
              onPress={auth.logout}
              accessibilityRole="button"
              accessibilityLabel="Disconnect Spotify"
            >
              <Text style={styles.ghostBtnText}>spotify ✓</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed, focused, disabled }) => [
                styles.spotifyBtn,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
                focused && focusRing(colors.serviceSpotify),
              ]}
              onPress={auth.login}
              disabled={!auth.canPrompt}
              accessibilityRole="button"
              accessibilityLabel="Connect Spotify"
              accessibilityState={{ disabled: !auth.canPrompt }}
            >
              <Text style={styles.spotifyBtnText}>connect spotify</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed, focused }) => [
              styles.addBtn,
              pressed && styles.pressed,
              focused && focusRing(colors.accentYellow),
            ]}
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={loaded ? 'Edit tape' : 'Add songs'}
          >
            <Text style={styles.addBtnText}>{loaded ? 'edit tape' : '+ add songs'}</Text>
          </Pressable>
        </View>
      </View>

      <TapeEditor
        visible={editing}
        onClose={() => setEditing(false)}
        tape={tape}
        catalog={MOCK_CATALOG}
        full={full}
        onAdd={add}
        onRemove={remove}
      />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: { width: '100%', maxWidth: layout.frameMax, paddingHorizontal: spacing.frameX },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  deckId: {
    flex: 1,
    color: colors.inkHeader,
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: '600',
    marginRight: spacing.stack - 6,
  },
  playControl: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: { color: colors.inkControl, fontSize: 12, letterSpacing: 1 },
  pressed: { opacity: motion.pressOpacity },
  disabled: { opacity: motion.disabledOpacity },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.stack,
    gap: spacing.stack - 6,
  },
  spotifyBtn: {
    backgroundColor: colors.serviceSpotify,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.btnX,
    paddingVertical: spacing.btnY,
    minHeight: 44,
    justifyContent: 'center',
  },
  spotifyBtnText: {
    color: colors.void,
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '600',
  },
  ghostBtn: {
    borderColor: colors.serviceSpotify,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.btnX,
    paddingVertical: spacing.btnY,
    minHeight: 44,
    justifyContent: 'center',
  },
  ghostBtnText: { color: colors.serviceSpotify, fontSize: 14, letterSpacing: 1 },
  addBtn: {
    borderColor: colors.accentYellow,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.btnX,
    paddingVertical: spacing.btnY,
    minHeight: 44,
    justifyContent: 'center',
  },
  addBtnText: { color: colors.accentYellow, fontSize: 14, letterSpacing: 1 },
});
