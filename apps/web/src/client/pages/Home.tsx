import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TaskInputBar } from '@/components/landing/TaskInputBar';
import { useDaemonStore } from '@/stores/daemonStore';
import { SettingsDialog } from '@/components/layout/SettingsDialog';
import { springs } from '@/lib/animations';
import { PlusMenu } from '@/components/landing/PlusMenu';
import { useHomePage } from './home/useHomePage';
import { FavoritesSection } from './home/FavoritesSection';
import { ExamplesSection } from './home/ExamplesSection';

export function HomePage() {
  const { t } = useTranslation('home');
  const daemonStatus = useDaemonStore((s) => s.status);
  const isDaemonReady = daemonStatus === 'connected';
  const {
    prompt,
    setPrompt,
    showAllFavorites,
    setShowAllFavorites,
    attachments,
    attachmentError,
    setAttachments,
    workingDirectory,
    setWorkingDirectory,
    showSettingsDialog,
    settingsInitialTab,
    favoritesList,
    removeFavorite,
    isLoading,
    useCaseExamples,
    displayedFavorites,
    hasMoreFavorites,
    handleSubmit,
    handleSettingsDialogChange,
    handleOpenSpeechSettings,
    handleOpenModelSettings,
    handleApiKeySaved,
    handleExampleClick,
    handleSkillSelect,
    handleAttachFiles,
    handleOpenSettings,
    MAX_FILES,
  } = useHomePage();
  const advantages = [
    t('advantages.offlineSafe'),
    t('advantages.scriptTools'),
    t('advantages.workflowOrchestration'),
    t('advantages.localMemory'),
  ];

  return (
    <>
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={handleSettingsDialogChange}
        onApiKeySaved={handleApiKeySaved}
        initialTab={settingsInitialTab}
      />

      <div className="h-full flex flex-col bg-accent relative overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 pb-0">
          <div className="w-full max-w-[720px] mx-auto flex flex-col items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 0.02 }}
              className="pt-[156px]"
            >
              <p className="text-center text-[18px] font-medium tracking-[0.04em] text-foreground/60">
                “{t('slogan')}”
              </p>
            </motion.div>

            <motion.h1
              data-testid="home-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springs.gentle}
              className="font-apparat text-[32px] tracking-[-0.015em] text-foreground w-full text-center"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 0.05 }}
              className="max-w-[620px] text-center text-sm leading-6 text-muted-foreground"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 0.08 }}
              className="flex w-full flex-wrap items-center justify-center gap-2"
            >
              {advantages.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/70 bg-background/85 px-3 py-1 text-[12px] font-medium tracking-[0.02em] text-foreground/80 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.gentle, delay: 0.1 }}
              className="w-full"
            >
              <TaskInputBar
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={!isDaemonReady}
                placeholder={
                  isDaemonReady ? t('inputPlaceholder') : t('daemonDisconnectedPlaceholder')
                }
                typingPlaceholder={true}
                large={true}
                autoFocus={true}
                onOpenSpeechSettings={handleOpenSpeechSettings}
                onOpenModelSettings={handleOpenModelSettings}
                hideModelWhenNoModel={true}
                attachments={attachments}
                attachmentError={attachmentError}
                onAttachmentsChange={setAttachments}
                toolbarLeft={
                  <PlusMenu
                    onSkillSelect={handleSkillSelect}
                    onOpenSettings={handleOpenSettings}
                    onAttachFiles={handleAttachFiles}
                    onSelectFolder={setWorkingDirectory}
                    disabled={isLoading}
                    attachmentCount={attachments.length}
                    maxAttachments={MAX_FILES}
                  />
                }
              />
              {workingDirectory && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                  <span className="truncate max-w-[400px]" title={workingDirectory}>
                    {t('selectedFolder.badge', { folder: workingDirectory })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWorkingDirectory(undefined)}
                    className="ml-1 hover:text-foreground transition-colors"
                    aria-label={t('selectedFolder.clearAriaLabel')}
                  >
                    ✕
                  </button>
                </div>
              )}
            </motion.div>

            <FavoritesSection
              favoritesList={favoritesList}
              displayedFavorites={displayedFavorites}
              hasMoreFavorites={hasMoreFavorites}
              showAllFavorites={showAllFavorites}
              onSetPrompt={setPrompt}
              onRemoveFavorite={removeFavorite}
              onShowAll={() => setShowAllFavorites(true)}
            />

            <ExamplesSection
              useCaseExamples={useCaseExamples}
              onExampleClick={handleExampleClick}
            />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-accent to-transparent" />
      </div>
    </>
  );
}
