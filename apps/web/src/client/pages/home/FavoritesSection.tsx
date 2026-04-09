import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChatText, FileMagnifyingGlass, PencilRuler, X } from '@phosphor-icons/react';
import { springs } from '@/lib/animations';
import type { StoredFavorite } from '@accomplish_ai/agent-core';
import { FAVORITES_PREVIEW_COUNT } from './useHomePage';

interface FavoritesSectionProps {
  favoritesList: StoredFavorite[];
  displayedFavorites: StoredFavorite[];
  hasMoreFavorites: boolean;
  showAllFavorites: boolean;
  onSetPrompt: (prompt: string) => void;
  onRemoveFavorite: (taskId: string) => void;
  onShowAll: () => void;
}

export function FavoritesSection({
  favoritesList,
  displayedFavorites,
  hasMoreFavorites,
  showAllFavorites,
  onSetPrompt,
  onRemoveFavorite,
  onShowAll,
}: FavoritesSectionProps) {
  const { t } = useTranslation('home');
  const removeFavoriteLabel = t('favorites.remove');
  const featuredApps = [
    {
      key: 'messageAuditor',
      icon: FileMagnifyingGlass,
      iconClassName: 'bg-[#F4EEE3] text-[#8A5B13]',
    },
    {
      key: 'productDesigner',
      icon: PencilRuler,
      iconClassName: 'bg-[#E6F2EC] text-[#2F6B4F]',
    },
    {
      key: 'smsLabeler',
      icon: ChatText,
      iconClassName: 'bg-[#E8EEF9] text-[#315A8C]',
    },
  ] as const;

  return (
    <div
      id="favorites"
      data-testid="favorites-section"
      className="flex flex-col gap-4 w-full scroll-mt-4 rounded-[28px] border border-border/60 bg-background/70 px-6 py-7 shadow-[0_20px_60px_rgba(20,20,20,0.04)] backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-apparat text-[24px] font-light tracking-[-0.72px] text-foreground">
          {t('favorites.title')}
        </h2>
        <p className="max-w-[560px] text-sm leading-6 text-muted-foreground">
          {t('favorites.description')}
        </p>
      </div>
      {favoritesList.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 w-full md:grid-cols-3">
            <AnimatePresence>
              {displayedFavorites.map((fav) => (
                <motion.div
                  key={fav.taskId}
                  role="button"
                  tabIndex={0}
                  data-testid="favorite-item"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springs.gentle}
                  whileTap={{ scale: 0.98 }}
                  layout
                  onClick={() => onSetPrompt(fav.prompt)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) {
                      return;
                    }
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSetPrompt(fav.prompt);
                    }
                  }}
                  className="group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-[24px] border border-border/70 bg-gradient-to-br from-[#FBFAF6] via-background to-[#F4F1E8] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_45px_rgba(20,20,20,0.08)] cursor-pointer"
                >
                  <div className="absolute right-[-24px] top-[-24px] h-24 w-24 rounded-full bg-[#EAE4D7]/70 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-3 w-full">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1F3E29] text-white shadow-sm">
                      <span className="font-apparat text-base tracking-[-0.04em]">
                        {(fav.summary || fav.prompt).trim().slice(0, 2) || '应用'}
                      </span>
                    </div>
                    <span className="rounded-full border border-border/70 bg-white/70 px-2.5 py-1 text-[11px] tracking-[0.14em] text-muted-foreground">
                      {t('favorites.cardType')}
                    </span>
                  </div>
                  <div className="relative mt-5 flex-1">
                    <h3 className="font-apparat text-[20px] leading-6 tracking-[-0.04em] text-foreground line-clamp-2">
                      {fav.summary || fav.prompt.slice(0, 36)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3">
                      {fav.prompt}
                    </p>
                  </div>
                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="text-[12px] tracking-[0.14em] text-[#1F3E29]">
                      {t('favorites.launch')}
                    </span>
                    <span className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 group-active:translate-y-0">
                      <button
                        type="button"
                        data-testid="favorite-remove"
                        data-fav-remove
                        onClick={(e) => {
                          e.stopPropagation();
                          void onRemoveFavorite(fav.taskId);
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
                        title={removeFavoriteLabel}
                        aria-label={removeFavoriteLabel}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {hasMoreFavorites && !showAllFavorites && (
            <button
              type="button"
              data-testid="favorites-show-all"
              onClick={onShowAll}
              className="mx-auto rounded-full border border-border/70 bg-background px-4 py-2 text-center text-[13px] leading-[15px] tracking-[0.02em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('favorites.showAll', { count: favoritesList.length })}
            </button>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full md:grid-cols-3">
          {featuredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.key}
                className="group relative overflow-hidden rounded-[24px] border border-border/70 bg-gradient-to-br from-[#FCFBF7] to-[#F3F0E8] p-5 shadow-[0_14px_35px_rgba(20,20,20,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(20,20,20,0.08)]"
              >
                <div className="absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full bg-white/40 blur-2xl" />
                <div className="relative flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${app.iconClassName}`}
                  >
                    <Icon size={24} weight="duotone" />
                  </div>
                  <span className="rounded-full border border-border/70 bg-white/70 px-2.5 py-1 text-[11px] tracking-[0.14em] text-muted-foreground">
                    {t('favorites.businessTag')}
                  </span>
                </div>
                <div className="relative mt-5">
                  <h3 className="font-apparat text-[20px] leading-6 tracking-[-0.04em] text-foreground">
                    {t(`favorites.apps.${app.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(`favorites.apps.${app.key}.description`)}
                  </p>
                </div>
                <div className="relative mt-5 text-[12px] tracking-[0.14em] text-[#1F3E29]">
                  {t('favorites.comingSoon')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { FAVORITES_PREVIEW_COUNT };
