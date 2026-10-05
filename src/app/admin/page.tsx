'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchRooms, addRoom, updateRoom, deleteRoom, updateHousekeepingStatus, HousekeepingStatus, Room } from '@/lib/features/roomSlice';
import { fetchStaff, addStaff, updateStaff, deleteStaff, Staff } from '@/lib/features/staffSlice';
import { fetchBookings, updateBooking, Booking } from '@/lib/features/bookingSlice';
import { RootState, AppDispatch } from '@/lib/store';
import {
  BedDouble,
  Users,
  CalendarCheck,
  BarChart3,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  CreditCard,
  PieChart,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPlus,
  KeyRound,
  PlusCircle,
  Shield,
  Sparkles,
  Clock,
  Eye,
} from 'lucide-react';
import PortalShell from '@/components/PortalShell';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import RoomModal from '@/components/Admin/RoomModal';
import RoomGalleryModal from '@/components/Guest/RoomGalleryModal';
import StaffModal from '@/components/Admin/StaffModal';
import ReportModal from '@/components/Admin/ReportModal';
import InvoiceModal from '@/components/ui/InvoiceModal';
import IncidentalChargeModal from '@/components/Staff/IncidentalChargeModal';
import { Modal } from '@/components/ui/Modal';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import { Toast } from '@/components/ui/Toast';
import { fetchAllUsers, updateUserRole, deleteUserAccount, updateUserProfile, User as UserAccount } from '@/lib/features/userSlice';
import { formatPrice, DEFAULT_COMPANY_PROFILE } from '@/lib/features/settingsSlice';

export default function AdminPage() {
  type TabType = 'inventory' | 'staff' | 'reservations' | 'users' | 'reports';
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedFolioBooking, setSelectedFolioBooking] = useState<Booking | null>(null);
  const [selectedIncidentalBooking, setSelectedIncidentalBooking] = useState<Booking | null>(null);
  const [customRoleUserId, setCustomRoleUserId] = useState<string | null>(null);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'guest',
  });
  const [customRoles, setCustomRoles] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('luxestay_custom_roles');
        if (stored) return JSON.parse(stored);
      } catch (_e) {}
    }
    return ['manager', 'supervisor'];
  });

  const saveCustomRole = (roleName: string) => {
    const cleaned = roleName.trim().toLowerCase();
    if (!cleaned) return;
    setCustomRoles((prev) => {
      const next = Array.from(new Set([...prev, cleaned]));
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxestay_custom_roles', JSON.stringify(next));
      }
      return next;
    });
  };

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const allUsers = useSelector((state: RootState) => state.user.allUsers || []);
  const rooms = useSelector((state: RootState) => state.rooms.items);
  const staff = useSelector((state: RootState) => state.staff.items);
  const bookings = useSelector((state: RootState) => state.bookings.items);
  const currency = useSelector((state: RootState) => state.settings?.currency || 'INR');
  const companyProfile = useSelector((state: RootState) => state.settings?.companyProfile || DEFAULT_COMPANY_PROFILE);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [galleryTourRoom, setGalleryTourRoom] = useState<Room | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'financial' | 'growth'>('financial');

  const allAvailableRoles = useMemo(() => {
    const baseRoles = ['guest', 'receptionist', 'staff', 'admin'];
    const userDefinedRoles = allUsers.map((u) => (u.role || '').toLowerCase()).filter(Boolean);
    return Array.from(new Set([...baseRoles, ...customRoles, ...userDefinedRoles]));
  }, [allUsers, customRoles]);

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchStaff());
    dispatch(fetchBookings());
    dispatch(fetchAllUsers());

    const interval = setInterval(() => {
      dispatch(fetchRooms());
      dispatch(fetchBookings());
    }, 5000);

    const onFocus = () => {
      dispatch(fetchRooms());
      dispatch(fetchBookings());
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Room handlers
  const handleSaveRoom = async (roomData: Partial<Room>) => {
    if (selectedRoom) {
      await dispatch(updateRoom({ ...selectedRoom, ...roomData } as Room));
      showToast('Suite updated successfully.');
    } else {
      await dispatch(
        addRoom({
          number: roomData.number || '100',
          type: roomData.type || 'Deluxe',
          price: roomData.price || 20000,
          status: roomData.status || 'available',
          capacity: roomData.capacity || 2,
          amenities: roomData.amenities || ['Terrace'],
          description: roomData.description,
          image: roomData.image || roomData.imageUrl,
          imageUrl: roomData.imageUrl || roomData.image,
          galleryImages: roomData.galleryImages,
        })
      );
      showToast('New suite registered successfully.');
    }
  };

  const handleDeleteRoom = (id: string) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Remove Suite from Inventory',
      description: 'Are you sure you want to remove this suite? This action cannot be undone.',
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
        await dispatch(deleteRoom(id));
        showToast('Suite removed from inventory.', 'info');
      },
    });
  };

  // Staff handlers
  const handleSaveStaff = async (staffData: Partial<Staff>) => {
    if (selectedStaff) {
      await dispatch(updateStaff({ ...selectedStaff, ...staffData } as Staff));
      if (user?.id === selectedStaff.id || user?.name === selectedStaff.name) {
        dispatch(updateUserProfile({
          name: staffData.name,
          email: staffData.email,
          department: staffData.department,
          shift: staffData.shift ? `${staffData.shift} Shift` : undefined,
        }));
      }
      showToast('Staff credentials updated.');
    } else {
      await dispatch(
        addStaff({
          name: staffData.name || '',
          email: staffData.email || '',
          role: staffData.role || 'Receptionist',
          department: staffData.department || 'Front Desk & Guest Services',
          shift: staffData.shift || 'Morning',
          status: staffData.status || 'Active',
        })
      );
      showToast('New staff member on-boarded.');
    }
    dispatch(fetchStaff());
    dispatch(fetchAllUsers());
  };

  const handleDeleteStaff = (id: string) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Off-board Staff Member',
      description: 'Are you sure you want to off-board this staff member? This will archive their staff profile.',
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
        await dispatch(deleteStaff(id));
        showToast('Staff member record archived.', 'info');
        dispatch(fetchStaff());
        dispatch(fetchAllUsers());
      },
    });
  };

  // KPIs
  const occupiedCount = useMemo(() => rooms.filter((r) => r.status === 'occupied').length, [rooms]);
  const occupancyPercent = Math.round((occupiedCount / Math.max(1, rooms.length)) * 100);
  const activeStaffCount = useMemo(() => staff.filter((s) => s.status === 'Active').length, [staff]);
  const totalRevenue = useMemo(
    () =>
      bookings
        .filter((b) => ['confirmed', 'checked_in', 'checked_out'].includes(b.status))
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
    [bookings]
  );

  // Filters
  const filteredRooms = useMemo(() => {
    return rooms.filter(
      (r) =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  const filteredStaff = useMemo(() => {
    return staff.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staff, searchQuery]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(b.id).includes(searchQuery) ||
        b.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const cleanRole = newRole.trim().toLowerCase();
      saveCustomRole(cleanRole);
      await dispatch(updateUserRole({ id: userId, role: cleanRole })).unwrap();
      showToast(`Role updated to ${cleanRole.toUpperCase()}. User permissions synced.`);
      dispatch(fetchAllUsers());
      dispatch(fetchStaff());
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Delete User Account',
      description: 'Are you sure you want to delete this user account? Their profile and associated records will be removed.',
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await dispatch(deleteUserAccount(userId)).unwrap();
          showToast('User account removed.', 'info');
          dispatch(fetchAllUsers());
          dispatch(fetchStaff());
        } catch (err: any) {
          showToast(typeof err === 'string' ? err : err?.message || 'Failed to delete user', 'error');
        }
      },
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      showToast('Username, email, and password are required');
      return;
    }
    const cleanPhone = newUserForm.phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      showToast('Valid phone number (at least 8 digits) is required');
      return;
    }
    setIsCreatingUser(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }
      showToast(`User @${newUserForm.username} created successfully!`);
      setIsUserModalOpen(false);
      setNewUserForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'guest',
      });
      dispatch(fetchAllUsers());
      dispatch(fetchStaff());
    } catch (err: any) {
      showToast(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const navItems = [
    {
      id: 'inventory',
      label: 'Suites & Rooms',
      icon: BedDouble,
      isActive: activeTab === 'inventory',
      onClick: () => setActiveTab('inventory'),
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: Users,
      isActive: activeTab === 'staff',
      onClick: () => setActiveTab('staff'),
    },
    {
      id: 'reservations',
      label: 'Guest Records',
      icon: CalendarCheck,
      isActive: activeTab === 'reservations',
      onClick: () => setActiveTab('reservations'),
    },
    {
      id: 'users',
      label: 'Access & Roles',
      icon: ShieldCheck,
      isActive: activeTab === 'users',
      onClick: () => setActiveTab('users'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      isActive: activeTab === 'reports',
      onClick: () => {
        setReportType('financial');
        setIsReportModalOpen(true);
      },
    },
  ];

  return (
    <PortalShell
      requiredRole="admin"
      title={companyProfile.adminName || 'Gopinath'}
      subtitle={companyProfile.adminTitle || 'Managing Director & General Manager'}
      navItems={navItems}
      activeNavId={activeTab}
      actions={
        activeTab === 'inventory' ? (
          <button
            type="button"
            onClick={() => {
              setSelectedRoom(null);
              setIsRoomModalOpen(true);
            }}
            className="btn-gold py-2.5 px-4 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> Add Room
          </button>
        ) : activeTab === 'staff' ? (
          <button
            type="button"
            onClick={() => {
              setSelectedStaff(null);
              setIsStaffModalOpen(true);
            }}
            className="btn-gold py-2.5 px-4 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} /> Add Staff Member
          </button>
        ) : activeTab === 'users' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(true)}
              className="btn-gold py-2.5 px-3 sm:px-4 text-xs inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm"
            >
              <UserPlus size={15} /> Add User
            </button>
            <button
              type="button"
              onClick={() => {
                setNewRoleInput('');
                setIsRoleModalOpen(true);
              }}
              className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs"
            >
              <ShieldCheck size={15} className="text-amber-600" /> Add Role
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setReportType('financial');
              setIsReportModalOpen(true);
            }}
            className="btn-gold py-2.5 px-4 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 size={15} /> Generate Report
          </button>
        )
      }
    >
      {/* Floating Bottom Toast Notification */}
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Modern Confirmation Delete Dialog */}
      <ConfirmDeleteModal
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.title}
        message={deleteDialog.description}
        confirmText="Confirm Delete"
        onConfirm={deleteDialog.onConfirm}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* KPI Cards: fluidly fits small laptops up to large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyPercent}%`}
          icon={PieChart}
          change={`${occupiedCount} / ${rooms.length} Suites`}
          changeType="positive"
          onClick={() => {
            setReportType('growth');
            setIsReportModalOpen(true);
          }}
        />
        <StatCard
          label="Total Inventory"
          value={rooms.length}
          icon={BedDouble}
          change="Live Keys"
          changeType="neutral"
          onClick={() => setActiveTab('inventory')}
        />
        <StatCard
          label="Total Revenue"
          value={formatPrice(totalRevenue, currency)}
          icon={CreditCard}
          change="Audited YTD"
          changeType="positive"
          onClick={() => {
            setReportType('financial');
            setIsReportModalOpen(true);
          }}
        />
        <StatCard
          label="Active Staff on Shift"
          value={`${activeStaffCount} / ${staff.length}`}
          icon={Users}
          change="Roster 100%"
          changeType="positive"
          onClick={() => setActiveTab('staff')}
        />
      </div>

      {/* ────────────────── TAB 1: SUITES INVENTORY ────────────────── */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Rooms & Inventory
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search room or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Suite Preview</th>
                    <th className="py-3.5 px-5 font-bold">Suite No.</th>
                    <th className="py-3.5 px-5 font-bold">Category</th>
                    <th className="py-3.5 px-5 font-bold">Rate / Night</th>
                    <th className="py-3.5 px-5 font-bold">Capacity</th>
                    <th className="py-3.5 px-5 font-bold">Housekeeping</th>
                    <th className="py-3.5 px-5 font-bold">Status</th>
                    <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5">
                        <div
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsRoomModalOpen(true);
                          }}
                          className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 shadow-xs border border-slate-200 group cursor-pointer"
                          title="Click to preview or change suite image"
                        >
                          <Image
                            src={room.imageUrl || room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                            alt={room.name || room.type || 'Suite'}
                            fill
                            sizes="64px"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                            <Edit2 size={13} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{String(room.number || room.roomNumber || room.id).replace(/^#/, '')}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">{room.type}</td>
                      <td className="py-3.5 px-5 text-slate-900 font-bold">
                        {formatPrice(room.price || 0, currency)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{room.capacity || 2} Guests</td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            (room.housekeepingStatus || 'inspected') === 'inspected' || (room.housekeepingStatus || 'inspected') === 'clean'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : room.housekeepingStatus === 'cleaning_in_progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : room.housekeepingStatus === 'dirty'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              (room.housekeepingStatus || 'inspected') === 'inspected' || (room.housekeepingStatus || 'inspected') === 'clean'
                                ? 'bg-emerald-500'
                                : room.housekeepingStatus === 'cleaning_in_progress'
                                ? 'bg-amber-500'
                                : room.housekeepingStatus === 'dirty'
                                ? 'bg-rose-500'
                                : 'bg-slate-500'
                            }`}
                          />
                          {String(room.housekeepingStatus || 'inspected').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={room.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setGalleryTourRoom(room)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Visual Tour & 360 Angles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsRoomModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Suite"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Suite"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredRooms.map((room) => (
                <div key={room.id} className="p-4 space-y-3">
                  <div
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsRoomModalOpen(true);
                    }}
                    className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 shadow-inner cursor-pointer group"
                  >
                    <Image
                      src={room.imageUrl || room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                      alt={room.name || room.type || 'Suite'}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={room.status} />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      Tap to change photo
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Room {String(room.number || room.roomNumber || room.id).replace(/^#/, '')}</span>
                      <span className="text-xs text-slate-500 block">{room.type}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-display text-base">
                      {formatPrice(room.price || 0, currency)} <span className="text-xs font-normal text-slate-500">/ night</span>
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Capacity: {room.capacity || 2} Guests</span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setGalleryTourRoom(room)}
                      className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                    >
                      <Eye size={13} /> Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsRoomModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      Edit Suite & Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: STAFF ROSTER ────────────────── */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Staff Directory
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Staff Member</th>
                    <th className="py-3.5 px-5 font-bold">Role / Department</th>
                    <th className="py-3.5 px-5 font-bold">Shift Schedule</th>
                    <th className="py-3.5 px-5 font-bold">Status</th>
                    <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <strong className="block text-slate-900">{member.name}</strong>
                        <span className="text-xs text-slate-500">{member.email}</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-800 font-semibold">{member.role}</td>
                      <td className="py-3.5 px-5 text-slate-600">{member.shift} Shift</td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={member.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsStaffModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStaff.map((member) => (
                <div key={member.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">{member.name}</strong>
                      <span className="text-xs text-slate-500">{member.role} · {member.shift} Shift</span>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsStaffModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(member.id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 3: RESERVATIONS ROSTER ────────────────── */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Reservations
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search guest or suite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Booking ID</th>
                    <th className="py-3.5 px-5 font-bold">Guest Name</th>
                    <th className="py-3.5 px-5 font-bold">Assigned Suite</th>
                    <th className="py-3.5 px-5 font-bold">Guest ID / KYC</th>
                    <th className="py-3.5 px-5 font-bold">Stay Schedule</th>
                    <th className="py-3.5 px-5 font-bold">Total Bill</th>
                    <th className="py-3.5 px-5 font-bold">Status</th>
                    <th className="py-3.5 px-5 font-bold text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{b.id}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800 max-w-[180px] break-words line-clamp-2" title={b.guestName}>{b.guestName}</td>
                      <td className="py-3.5 px-5 text-slate-700">Room {String(b.roomNumber || b.roomId).replace(/^#/, '')}</td>
                      <td className="py-3.5 px-5">
                        {b.kyc?.verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            Not Verified
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                        <div>{b.checkInDate} →</div>
                        <div>{b.checkOutDate} ({b.nights || 1}N)</div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 font-display text-base">
                        {formatPrice(Number(b.totalPrice) || 0, currency)}
                        {b.incidentalCharges && b.incidentalCharges.length > 0 && (
                          <span className="text-[10px] text-amber-700 block font-sans font-medium">
                            +{formatPrice(b.incidentalCharges.reduce((sum, item) => sum + Number(item.amount || 0), 0), currency)} extras
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        {b.status === 'checked_in' && (
                          <button
                            type="button"
                            onClick={() => setSelectedIncidentalBooking(b)}
                            className="py-1 px-2.5 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Post extra charge"
                          >
                            <PlusCircle size={13} /> + Charges
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedFolioBooking(b)}
                          className="btn-gold py-1.5 px-3 text-xs"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <div key={b.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{b.guestName}</span>
                      <span className="text-xs text-slate-500">Room {String(b.roomNumber || b.roomId).replace(/^#/, '')}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{b.checkInDate} → {b.checkOutDate}</span>
                    <strong className="text-slate-900">{formatPrice(Number(b.totalPrice) || 0, currency)}</strong>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedFolioBooking(b)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg inline-flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                    >
                      <FileText size={12} /> Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 4: USER ACCESS & ROLE PERMISSIONS ────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-amber-600" size={24} />
                Users & Roles
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, email, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white shadow-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="btn-gold py-2 px-3 sm:px-4 text-xs inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shadow-sm"
              >
                <UserPlus size={15} /> Add User
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewRoleInput('');
                  setIsRoleModalOpen(true);
                }}
                className="px-3 sm:px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shadow-xs"
              >
                <ShieldCheck size={15} className="text-amber-600" /> Add Role
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Account User</th>
                    <th className="py-3.5 px-5 font-bold">Contact Email</th>
                    <th className="py-3.5 px-5 font-bold">Role</th>
                    <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isRootAdmin = String(u.id) === '1' || u.username === 'admin';
                    const role = u.role?.toLowerCase() || 'guest';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs ring-2 ring-amber-400/20">
                            {(u.name || u.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-medium">{u.name || u.username}</span>
                            {isRootAdmin && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                                Primary Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          {u.email || '—'}
                        </td>
                        <td className="py-3.5 px-5">
                          {isRootAdmin ? (
                            <span className="text-xs text-slate-400 font-medium">
                              Primary Account
                            </span>
                          ) : customRoleUserId === String(u.id) ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={customRoleInput}
                                onChange={(e) => setCustomRoleInput(e.target.value)}
                                placeholder="Custom role..."
                                className="text-xs px-2 py-1 border border-slate-300 rounded-lg outline-none w-28 font-medium text-slate-800"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customRoleInput.trim()) {
                                    const cleanRole = customRoleInput.trim().toLowerCase();
                                    saveCustomRole(cleanRole);
                                    handleRoleChange(String(u.id), cleanRole);
                                  }
                                  setCustomRoleUserId(null);
                                  setCustomRoleInput('');
                                }}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomRoleUserId(null);
                                  setCustomRoleInput('');
                                }}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <select
                              value={role}
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setCustomRoleUserId(String(u.id));
                                  setCustomRoleInput('');
                                  return;
                                }
                                handleRoleChange(String(u.id), e.target.value);
                              }}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 hover:border-amber-500 focus:ring-2 focus:ring-amber-500/20 cursor-pointer transition-colors shadow-xs capitalize"
                            >
                              {allAvailableRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                              <option value="custom">+ Custom Role...</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(String(u.id))}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isRootAdmin = String(u.id) === '1' || u.username === 'admin';
                const role = u.role?.toLowerCase() || 'guest';
                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {(u.name || u.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-slate-900 block text-sm">{u.name || u.username}</strong>
                          {u.email && <span className="text-xs text-slate-500">{u.email}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">Role:</span>
                      <div className="flex items-center gap-2">
                        {isRootAdmin ? (
                          <span className="text-xs text-slate-400 font-medium">Primary Account</span>
                        ) : customRoleUserId === String(u.id) ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={customRoleInput}
                              onChange={(e) => setCustomRoleInput(e.target.value)}
                              placeholder="Custom role..."
                              className="text-xs px-2 py-1 border border-slate-300 rounded-lg outline-none w-24 font-medium text-slate-800"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customRoleInput.trim()) {
                                  const cleanRole = customRoleInput.trim().toLowerCase();
                                  saveCustomRole(cleanRole);
                                  handleRoleChange(String(u.id), cleanRole);
                                }
                                setCustomRoleUserId(null);
                                setCustomRoleInput('');
                              }}
                              className="px-2 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomRoleUserId(null);
                                setCustomRoleInput('');
                              }}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            value={role}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setCustomRoleUserId(String(u.id));
                                setCustomRoleInput('');
                                return;
                              }
                              handleRoleChange(String(u.id), e.target.value);
                            }}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 capitalize"
                          >
                            {allAvailableRoles.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                            <option value="custom">+ Custom Role...</option>
                          </select>
                        )}
                        {!isRootAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(String(u.id))}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── MODALS ────────────────── */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={handleSaveRoom}
        room={selectedRoom}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSave={handleSaveStaff}
        staff={selectedStaff}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        type={reportType}
        totalRevenue={totalRevenue}
        totalRooms={rooms.length}
        occupiedRooms={occupiedCount}
        totalBookings={bookings.length}
      />

      <InvoiceModal
        isOpen={!!selectedFolioBooking}
        onClose={() => setSelectedFolioBooking(null)}
        booking={selectedFolioBooking}
      />

      {/* ────────────────── INCIDENTAL FOLIO CHARGE MODAL ────────────────── */}
      <IncidentalChargeModal
        isOpen={!!selectedIncidentalBooking}
        onClose={() => setSelectedIncidentalBooking(null)}
        booking={selectedIncidentalBooking}
      />

      {/* Visual Tour & 360 Angles Modal */}
      <RoomGalleryModal
        isOpen={!!galleryTourRoom}
        onClose={() => setGalleryTourRoom(null)}
        room={galleryTourRoom}
      />

      {/* Add New Custom Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="text-amber-600" size={20} />
                Create New Role
              </h3>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Role Name</label>
              <input
                type="text"
                placeholder="e.g. Concierge, Supervisor, Security"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newRoleInput.trim()) {
                      saveCustomRole(newRoleInput);
                      showToast(`Role "${newRoleInput.trim().toUpperCase()}" created and added to available roles.`);
                      setIsRoleModalOpen(false);
                      setNewRoleInput('');
                    }
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                autoFocus
              />
              <p className="text-[11px] text-slate-500">
                This custom role will be immediately available in all user role selectors.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newRoleInput.trim()) {
                    saveCustomRole(newRoleInput);
                    showToast(`Role "${newRoleInput.trim().toUpperCase()}" created and added to available roles.`);
                    setIsRoleModalOpen(false);
                    setNewRoleInput('');
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add New User Account Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="text-amber-600" size={20} />
                Create User Account
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. eleanor"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium capitalize bg-white"
                  >
                    {allAvailableRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. eleanor@luxestay.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value.trim() })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Phone (min 8 digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
