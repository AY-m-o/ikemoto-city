import { useState, useEffect } from "react";
import { MARKET_ITEMS, SHOP_META } from "./constants.js";
import { useI18n } from "./i18n.js";
import AssetDetail from "./AssetDetail.jsx";
import StorePage from "./StorePage.jsx";
import StoreList from "./StoreList.jsx";

// ─────────────────────────────────────────────
// MARKET SCREEN（オーケストレーター）
// ─────────────────────────────────────────────
export default function MarketScreen({ onNudge, followedShops, onFollowShop, likedItems, onLikeItem, likedShops, onLikeShop, jumpTo, onJumpClear, blockedShops, onBlockShop, lang }) {
  const t = useI18n(lang);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const followed = followedShops || {};
  const liked    = likedItems    || {};
  const likedS   = likedShops    || {};
  const blocked  = blockedShops  || {};

  const shops = [...new Set(MARKET_ITEMS.map(i => i.shop))].map(shopName => {
    const items = MARKET_ITEMS.filter(i => i.shop === shopName);
    const depts = [...new Set(items.map(i => i.dept))];
    const meta = SHOP_META[shopName] || { desc:"", grad:"linear-gradient(135deg,#1a2a3a,#2a3a50)" };
    return { name:shopName, items, depts, count:items.length, ...meta };
  }).filter(s => !blocked[s.name]);

  // マイページからのディープリンク遷移
  useEffect(() => {
    if (!jumpTo) return;
    const shop = shops.find(s => s.name === jumpTo.shop);
    if (!shop) return;
    if (jumpTo.itemName) {
      const item = shop.items.find(i => i.name === jumpTo.itemName);
      if (item) { setSelectedShop(shop); setSelectedItem(item); }
    } else {
      setSelectedShop(shop);
    }
    onJumpClear && onJumpClear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo]);

  // 作品詳細
  if (selectedItem) {
    return (
      <AssetDetail
        item={selectedItem}
        shopName={selectedShop?.name}
        onBack={() => { setSelectedItem(null); onNudge(); }}
        onNudge={onNudge}
        likedItems={liked}
        onLikeItem={onLikeItem}
      />
    );
  }

  // 店舗詳細
  if (selectedShop) {
    return (
      <StorePage
        shop={selectedShop}
        followed={followed}
        likedShops={likedS}
        onFollowShop={onFollowShop}
        onLikeShop={onLikeShop}
        onBlockShop={onBlockShop}
        onSelectItem={(item) => { setSelectedItem(item); onNudge(); }}
        onBack={() => setSelectedShop(null)}
        onNudge={onNudge}
      />
    );
  }

  // 店舗一覧
  return (
    <StoreList
      shops={shops}
      followed={followed}
      likedShops={likedS}
      onBlockShop={onBlockShop}
      onSelectShop={setSelectedShop}
      onNudge={onNudge}
      t={t}
    />
  );
}
