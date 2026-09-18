import { useEffect, useState } from "react";
import {
  Plus,
  MessageSquare,
  LogOut,
  User,
  Search,
  PanelLeftClose,
  PanelLeft,
  X,
  Menu,
  CoinsIcon,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { getConversations } from "../features/conversation.api";
import {
  setConversations,
  setSelectedConversation,
} from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import BillingDrawer from "./BillingDrawer";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const { userData } = useSelector((state) => state.user);
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (error) {
        console.log("Fetch conversations error:", error);
      }
    };
    const uid = userData?._id || userData?.userId;
    if (uid) {
      fetchConversations();
    }
  }, [userData?._id, userData?.userId]);

  const handleCreateConversation = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    setMobileOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));

    // ✅ Fix: Messages array mein se last artifact dhoondh kar restore karein
    if (Array.isArray(messages) && messages.length > 0) {
      const lastMsgWithArtifacts = [...messages]
        .reverse()
        .find((m) => m.artifacts && m.artifacts.length > 0);
      if (lastMsgWithArtifacts?.artifacts) {
        dispatch(setArtifacts(lastMsgWithArtifacts.artifacts));
      } else {
        dispatch(setArtifacts([]));
      }
    } else {
      dispatch(setArtifacts([]));
    }
  };

  // Filter conversations by search query
  const filteredConversations = (conversations || []).filter((c) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /* ── Collapsed Desktop Rail ── */
  const CollapsedRail = () => (
    <div className="hidden lg:flex flex-col items-center w-[60px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-3.5 gap-2 shrink-0 select-none">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
        title="Expand Sidebar"
      >
        <PanelLeft size={18} />
      </button>

      <button
        onClick={handleCreateConversation}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-90 transition-opacity cursor-pointer mt-1"
        title="New Chat"
      >
        <Plus size={18} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1.5 overflow-y-auto w-full px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-2">
        {conversations.slice(0, 8).map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              title={chat.title}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"
              }`}
            >
              <MessageSquare size={15} />
            </button>
          );
        })}
      </div>

      {userData && (
        <div className="mt-auto relative">
          {userData.avatar && !imageError ? (
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-8 h-8 rounded-xl object-cover border border-indigo-500/30"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-slate-400">
              <User size={14} />
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0d0f14]" />
        </div>
      )}
    </div>
  );

  /* ── Full Sidebar Content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full select-none">
      {/* Header with App Logo & Collapse */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles size={14} />
          </div>
          <span className="text-[15px] font-bold text-slate-100 tracking-tight">
            Bearly AI
          </span>
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Collapse Sidebar"
        >
          <PanelLeftClose size={16} />
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3.5 pt-3 pb-1.5">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 rounded-xl py-2.5 shadow-md shadow-indigo-500/15 transition-all duration-150 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Live Search Chats Input */}
      <div className="px-3.5 py-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] focus-within:border-indigo-500/40 text-slate-400">
          <Search size={13} className="shrink-0 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-transparent text-[12.5px] text-slate-200 placeholder:text-slate-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-500 hover:text-slate-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Recents Label */}
      <div className="px-4.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
        Recent Chats
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2.5 space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredConversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12px] text-slate-500">
            {searchQuery
              ? "No matching chats found."
              : "No previous conversations."}
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = selectedConversation?._id === chat._id;
            return (
              <div
                key={chat._id}
                onClick={() => handleSelectConversation(chat)}
                className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-indigo-500/15 text-slate-100 font-medium border border-indigo-500/25 shadow-sm shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                )}

                <MessageSquare
                  size={14}
                  className={`shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"}`}
                />

                <span className="text-[13px] truncate flex-1">
                  {chat.title || "Untitled Session"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0d0f14]/50">
        {userData ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="relative shrink-0">
              {userData.avatar && !imageError ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-8 h-8 rounded-lg object-cover border border-indigo-500/30"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {userData.name?.[0] || "U"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0d0f14]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate">
                {userData.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                  {userData.plan || "Free"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {userData.credits ?? 100} credits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowBilling(true)}
                className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                title="Upgrade / Buy Credits"
              >
                <CoinsIcon size={15} />
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-slate-500">
            Not logged in
          </div>
        )}
      </div>
    </div>
  );

  if (collapsed) return <CollapsedRail />;

  return (
    <>
      {/* Mobile Hamburger Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 flex items-center justify-center w-8 h-8 rounded-xl bg-[#13151f] border border-white/[0.08] text-slate-300 shadow-md cursor-pointer"
      >
        <Menu size={16} />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in"
        />
      )}

      {/* Full Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[265px] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06] transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Billing Modal Drawer */}
      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
    </>
  );
}
