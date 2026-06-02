import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Tape, Track, MAX_TRACKS } from './types';
import { hasTrack, totalDuration } from './tape';
import { fmtDuration } from '../catalog/mockCatalog';

// TapeEditor — the "add songs" surface. Top: the loaded tape (tap a track to
// remove). Bottom: the catalog (tap a song to add). The 20-track cap is shown
// and enforced visually — a full tape greys out the catalog.

const YELLOW = '#E9E64B';

interface Props {
  visible: boolean;
  onClose: () => void;
  tape: Tape;
  catalog: Track[];
  full: boolean;
  onAdd: (t: Track) => void;
  onRemove: (id: string) => void;
}

export default function TapeEditor({ visible, onClose, tape, catalog, full, onAdd, onRemove }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>tape</Text>
            <Text style={[styles.count, full && styles.countFull]}>
              {tape.tracks.length}/{MAX_TRACKS}
              {full ? ' · full' : ''}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>done</Text>
            </Pressable>
          </View>

          <Text style={styles.meta}>
            {tape.tracks.length === 0
              ? 'no tape loaded — add songs below'
              : `${fmtDuration(totalDuration(tape))} total`}
          </Text>

          <ScrollView style={styles.scroll}>
            {/* Loaded tracks */}
            {tape.tracks.map((t, i) => (
              <Pressable key={t.id} style={styles.row} onPress={() => onRemove(t.id)}>
                <Text style={styles.index}>{(i + 1).toString().padStart(2, '0')}</Text>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{t.title}</Text>
                  <Text style={styles.rowArtist}>{t.artist}</Text>
                </View>
                <Text style={styles.dur}>{fmtDuration(t.durationSec)}</Text>
                <Text style={styles.action}>✕</Text>
              </Pressable>
            ))}

            <Text style={styles.sectionLabel}>catalog</Text>

            {/* Catalog — add to tape */}
            {catalog.map((t) => {
              const added = hasTrack(tape, t.id);
              const blocked = added || full;
              return (
                <Pressable
                  key={t.id}
                  style={[styles.row, blocked && styles.rowDisabled]}
                  disabled={blocked}
                  onPress={() => onAdd(t)}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{t.title}</Text>
                    <Text style={styles.rowArtist}>{t.artist}</Text>
                  </View>
                  <Text style={styles.dur}>{fmtDuration(t.durationSec)}</Text>
                  <Text style={[styles.action, added && styles.added]}>
                    {added ? '✓' : full ? '–' : '+'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#101010',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: '#262626',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#F2F2F2', fontSize: 22, fontWeight: '300', letterSpacing: 1 },
  count: { color: '#888', fontSize: 13, letterSpacing: 1 },
  countFull: { color: YELLOW },
  close: { color: YELLOW, fontSize: 15, letterSpacing: 1 },
  meta: { color: '#666', fontSize: 12, marginTop: 6, marginBottom: 10, letterSpacing: 0.5 },
  scroll: { marginTop: 4 },
  sectionLabel: {
    color: '#555',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1C1C1C',
    gap: 12,
  },
  rowDisabled: { opacity: 0.35 },
  index: { color: YELLOW, fontSize: 13, width: 22 },
  rowText: { flex: 1 },
  rowTitle: { color: '#EDEDED', fontSize: 15 },
  rowArtist: { color: '#777', fontSize: 12, marginTop: 2 },
  dur: { color: '#888', fontSize: 13, fontVariant: ['tabular-nums'] },
  action: { color: YELLOW, fontSize: 18, width: 22, textAlign: 'center' },
  added: { color: '#5A5A5A' },
});
