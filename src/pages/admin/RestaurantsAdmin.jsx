import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus, Pencil, Trash2, X, Loader2, Upload, UtensilsCrossed, Search,
  GripVertical, Star, Bird, Award, ChevronDown, ChevronRight
} from 'lucide-react';
import RestaurantForm from '@/components/admin/RestaurantForm';

export default function RestaurantsAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [showFeatured, setShowFeatured] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const fileRef = useRef();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['adminRestaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 200),
  });

  const featuredPartners = restaurants
    .filter(r => r.is_featured_partner)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  const nonFeatured = restaurants.filter(r => !r.is_featured_partner);

  const filteredNonFeatured = nonFeatured.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q);
  });

  const filteredFeatured = featuredPartners.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q);
  });

  const handleAdd = () => { setEditing(null); setShowForm(true); };
  const handleEdit = (r) => { setEditing(r); setShowForm(true); };
  const handleClose = () => { setEditing(null); setShowForm(false); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant?')) return;
    try {
      await base44.entities.Restaurant.delete(id);
      toast({ title: 'Restaurant deleted' });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = [...featuredPartners];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Optimistically update cache
    queryClient.setQueryData(['adminRestaurants'], (old) => {
      if (!old) return old;
      const updates = reordered.map((r, i) => ({ ...r, sort_order: i + 1 }));
      const others = old.filter(r => !r.is_featured_partner);
      return [...updates, ...others];
    });

    try {
      await base44.entities.Restaurant.bulkUpdate(
        reordered.map((r, i) => ({ id: r.id, sort_order: i + 1 }))
      );
      toast({ title: 'Featured order updated' });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (err) {
      toast({ title: 'Reorder failed', description: err.message, variant: 'destructive' });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      toast({ title: 'Importing...', description: 'Processing CSV file' });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            restaurants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  cuisine: { type: 'string' },
                  image_url: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  hours: { type: 'string' },
                  website_url: { type: 'string' },
                  menu_url: { type: 'string' },
                  reservation_url: { type: 'string' },
                  location: { type: 'string' },
                  price_range: { type: 'string' },
                  is_waterfront: { type: 'boolean' },
                  has_indoor_seating: { type: 'boolean' },
                  has_outdoor_seating: { type: 'boolean' },
                  is_kid_friendly: { type: 'boolean' },
                  is_dog_friendly: { type: 'boolean' },
                  has_vegan_options: { type: 'boolean' },
                  has_gluten_free_options: { type: 'boolean' },
                  has_vegetarian_options: { type: 'boolean' },
                  offers_takeout: { type: 'boolean' },
                  offers_delivery: { type: 'boolean' },
                  offers_catering: { type: 'boolean' },
                  supports_private_events: { type: 'boolean' },
                  dress_code: { type: 'string' },
                  is_featured_partner: { type: 'boolean' },
                  is_birdie_trusted_partner: { type: 'boolean' },
                  is_concierge_recommended: { type: 'boolean' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const list = result?.output?.restaurants || result?.output || [];
      if (Array.isArray(list) && list.length > 0) {
        await base44.entities.Restaurant.bulkCreate(list);
        toast({ title: `Imported ${list.length} restaurants` });
        queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
        queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      } else {
        toast({ title: 'No rows found in file', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    }
    e.target.value = '';
  };

  return (
    <div className="px-4 py-4 pb-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-foreground">Restaurants</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.json" onChange={handleImport} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-sand/40">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, cuisine, location..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : (
        <div className="space-y-4">
          {/* Featured Partners — drag to reorder */}
          {filteredFeatured.length > 0 && (
            <div>
              <button onClick={() => setShowFeatured(!showFeatured)}
                className="flex items-center gap-1.5 mb-2 text-xs font-bold text-foreground uppercase tracking-luxe-sm">
                {showFeatured ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Star className="w-3.5 h-3.5 text-accent" />
                Featured Partners ({filteredFeatured.length})
              </button>
              {showFeatured && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="featured-restaurants">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {filteredFeatured.map((r, index) => (
                          <Draggable key={r.id} draggableId={r.id} index={index}>
                            {(prov, snapshot) => (
                              <div ref={prov.innerRef} {...prov.draggableProps}
                                className={`bg-accent/5 border border-accent/30 rounded-xl p-3 flex items-center gap-2 ${snapshot.isDragging ? 'shadow-luxe-lg ring-2 ring-accent/40' : ''}`}>
                                <div {...prov.dragHandleProps} className="p-1 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                                {r.image_url ? (
                                  <img src={r.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center flex-shrink-0">
                                    <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground line-clamp-1">{r.name}</p>
                                  <p className="text-xs text-muted-foreground">{r.cuisine}{r.price_range ? ` · ${r.price_range}` : ''}{r.location ? ` · ${r.location}` : ''}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleEdit(r)} className="p-1.5 rounded-lg hover:bg-sand/40 text-muted-foreground hover:text-foreground">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}

          {/* All Restaurants */}
          {filteredNonFeatured.length > 0 && (
            <div>
              <button onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1.5 mb-2 text-xs font-bold text-foreground uppercase tracking-luxe-sm">
                {showAll ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                All Restaurants ({filteredNonFeatured.length})
              </button>
              {showAll && (
                <div className="space-y-2">
                  {filteredNonFeatured.map(r => (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-sand flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.cuisine}{r.price_range ? ` · ${r.price_range}` : ''}{r.location ? ` · ${r.location}` : ''}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.is_waterfront && <Badge label="Waterfront" />}
                          {r.is_kid_friendly && <Badge label="Kid-Friendly" />}
                          {r.has_vegan_options && <Badge label="Vegan" />}
                          {r.has_gluten_free_options && <Badge label="GF" />}
                          {r.has_outdoor_seating && <Badge label="Outdoor" />}
                          {r.is_birdie_trusted_partner && <Badge label="Birdie Trusted" icon={Bird} accent />}
                          {r.is_concierge_recommended && <Badge label="Concierge Pick" icon={Award} accent />}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleEdit(r)} className="p-2 rounded-lg hover:bg-sand/40 text-muted-foreground hover:text-foreground">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredFeatured.length === 0 && filteredNonFeatured.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No restaurants yet</p>
              <p className="text-xs mt-1">Add one or import from CSV</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <RestaurantForm restaurant={editing} onClose={handleClose} />
      )}
    </div>
  );
}

function Badge({ label, icon: Icon, accent }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${accent ? 'bg-accent/15 text-accent' : 'bg-sand text-muted-foreground'}`}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}