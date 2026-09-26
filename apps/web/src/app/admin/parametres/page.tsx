'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, PlatformSetting } from '@/lib/api/settings';
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const KNOWN_SETTINGS = [
  { key: 'SERVICE_FEE_PERCENTAGE', label: 'Frais de service globaux (%)', type: 'number', default: '5', description: 'Le pourcentage prélevé sur chaque transaction.' },
  { key: 'SUPPORT_EMAIL', label: 'Email du support', type: 'email', default: 'support@babydja.ci', description: 'Adresse email affichée pour l\'assistance client.' },
  { key: 'SUPPORT_PHONE', label: 'Téléphone du support', type: 'text', default: '+22500000000', description: 'Numéro de téléphone d\'assistance.' },
  { key: 'ENABLE_FLIGHTS', label: 'Activer le module de Vols', type: 'checkbox', default: 'false', description: 'Active ou désactive la recherche de billets d\'avion.' },
];

export default function AdminParametres() {
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const { data: dbSettings = [], isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (!isLoading) {
      const initial: Record<string, string> = {};
      KNOWN_SETTINGS.forEach(setting => {
        const found = dbSettings.find((s: PlatformSetting) => s.key === setting.key);
        initial[setting.key] = found ? found.value : setting.default;
      });
      setLocalValues(initial);
    }
  }, [dbSettings, isLoading]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: { key: string; value: string; description?: string }[]) => updateSettings(newSettings),
    onSuccess: () => {
      toast.success('Paramètres mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour des paramètres'),
  });

  const handleSave = () => {
    const payload = KNOWN_SETTINGS.map(setting => ({
      key: setting.key,
      value: localValues[setting.key] ?? setting.default,
      description: setting.description,
    }));
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
          <SettingsIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Paramètres globaux</h1>
          <p className="text-sm text-gray-500">Configuration générale de la plateforme Babydja.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="grid gap-6 sm:grid-cols-2">
            {KNOWN_SETTINGS.map(setting => (
              <div key={setting.key} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-1">{setting.label}</label>
                <p className="text-xs text-gray-500 mb-3">{setting.description}</p>
                
                {setting.type === 'checkbox' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={localValues[setting.key] === 'true'}
                      onChange={(e) => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.checked ? 'true' : 'false' }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {localValues[setting.key] === 'true' ? 'Activé' : 'Désactivé'}
                    </span>
                  </label>
                ) : (
                  <input
                    type={setting.type}
                    value={localValues[setting.key] || ''}
                    onChange={(e) => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                )}
              </div>
            ))}
          </div>

        </div>
        
        <div className="bg-gray-50 px-6 py-4 sm:px-8 border-t border-gray-100 flex justify-end">
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex items-center gap-2">
            {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
