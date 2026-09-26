'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenantEmployees, addTenantEmployee, updateTenantEmployee, Employee } from '@/lib/api/employees';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Plus, UserCircle2, Mail, Phone, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from '@/lib/validators';
import Pagination from '@/components/ui/Pagination';

export default function EmployeeManager() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const tenantId = user?.tenantId;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      role: 'TENANT_EMPLOYEE',
    },
  });

  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['tenant-employees', tenantId, page],
    queryFn: () => getTenantEmployees(tenantId!, page, 10),
    enabled: !!tenantId,
  });

  const employees = response?.data || [];
  const meta = response?.meta;

  const addMutation = useMutation({
    mutationFn: (payload: EmployeeFormData) => addTenantEmployee(tenantId!, payload),
    onSuccess: () => {
      toast.success('Employé ajouté avec succès');
      setIsModalOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['tenant-employees', tenantId] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => updateTenantEmployee(tenantId!, id, { isActive }),
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['tenant-employees', tenantId] });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    addMutation.mutate(data);
  };

  const handleToggleStatus = (emp: Employee) => {
    const confirmMessage = emp.isActive 
      ? 'Êtes-vous sûr de vouloir désactiver ce collaborateur ?' 
      : 'Êtes-vous sûr de vouloir réactiver ce collaborateur ?';
      
    if (window.confirm(confirmMessage)) {
      toggleStatusMutation.mutate({ id: emp.id, isActive: !emp.isActive });
    }
  };

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Équipe et Personnel</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les accès de vos collaborateurs à l&apos;espace Gérant.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex min-h-[44px] w-full items-center justify-center gap-2 sm:w-auto">
          <Plus className="size-4 shrink-0" /> Ajouter un collaborateur
        </Button>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold">Collaborateur</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold">Rôle</th>
              <th className="px-6 py-4 font-semibold">Statut</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp: Employee) => (
              <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="size-8 text-gray-300" />
                    <div>
                      <p className="font-bold text-gray-900">{emp.user.firstName} {emp.user.lastName}</p>
                      <p className="text-xs text-gray-500">ID: {emp.user.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1.5"><Phone className="size-3"/> {emp.user.phone || 'Non renseigné'}</span>
                    <span className="flex items-center gap-1.5"><Mail className="size-3"/> {emp.user.email || 'Non renseigné'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={emp.role === 'TENANT_ADMIN' ? 'warning' : 'info'}>
                    <ShieldCheck className="size-3 inline mr-1" />
                    {emp.role === 'TENANT_ADMIN' ? 'Gérant Principal' : 'Staff / Employé'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={emp.isActive ? 'success' : 'danger'}>{emp.isActive ? 'Actif' : 'Désactivé'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleStatus(emp)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${emp.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                  >
                    {emp.isActive ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">Aucun collaborateur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.lastPage > 1 && (
        <Pagination 
          currentPage={page} 
          lastPage={meta.lastPage} 
          onPageChange={setPage} 
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-8 max-h-[90dvh] w-full min-w-0 max-w-md overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-1">Nouveau collaborateur</h2>
            <p className="text-sm text-gray-500 mb-6">Un code OTP sera envoyé pour sa première connexion.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Prénom</label>
                  <input type="text" {...register('firstName')} className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom</label>
                  <input type="text" {...register('lastName')} className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone (Requis)</label>
                <input type="tel" {...register('phone')} className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`} placeholder="+225..." />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email (Optionnel)</label>
                <input type="email" {...register('email')} className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rôle</label>
                <select {...register('role')} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary bg-white">
                  <option value="TENANT_EMPLOYEE">Staff / Employé normal</option>
                  <option value="TENANT_ADMIN">Gérant Principal</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>
            
              <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" className="min-h-[44px] flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" className="min-h-[44px] flex-1" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
