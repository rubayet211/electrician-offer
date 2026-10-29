import React, { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, UploadCloud, X, AlertCircle } from "lucide-react";
import { getService } from "@/lib/config/site";
import { parsedClientConfig } from "@/config/client.config";
import {
  PANEL_REASON_OPTIONS,
  PANEL_PROPERTY_OPTIONS,
  PROPERTY_OPTIONS,
  OWNS_CHARGER_OPTIONS,
  INSTALL_LOCATION_OPTIONS,
  STARTED_WHEN_OPTIONS,
  LIGHTING_SETTING_OPTIONS,
  FIXTURE_COUNT_OPTIONS,
  INSTALL_TYPE_OPTIONS,
  GENERATOR_TYPE_OPTIONS,
} from "@/lib/inquiries/schema";
import { Button, Label, Input, Select, Textarea, Hint, FieldError, Notice } from "@/components/ui";
import { processImageFile, formatFileSize, type ProcessedPhoto } from "./image-utils";
import type { FormState, FieldErrors } from "./types";

export interface Step2Props {
  formState: FormState;
  errors: FieldErrors;
  photos: ProcessedPhoto[];
  onPhotosChange: (photos: ProcessedPhoto[]) => void;
  onChange: (updates: Partial<FormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Details({
  formState,
  errors,
  photos,
  onPhotosChange,
  onChange,
  onNext,
  onBack,
}: Step2Props) {
  const service = getService(formState.serviceSlug);
  const formType = service?.formType || "general";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const { uploads } = parsedClientConfig;
  const maxPhotos = uploads.maxFiles || 3;

  const getServiceHint = () => {
    switch (formType) {
      case "panel":
        return "What are you adding or what's prompting the upgrade? If you know your current panel size, include it — no need to open the panel.";
      case "troubleshooting":
        return "Describe what happened, which rooms or appliances are affected, and whether a breaker tripped.";
      case "ev_charger":
        return "Include your vehicle model or intended charger model, and where on the property you want it installed.";
      case "lighting":
        return "Describe the fixtures you want installed or replaced, indoor or outdoor locations, and ceiling height if unusual.";
      case "generator":
        return "Describe your backup power needs (essential circuits vs whole home) and preferred fuel source if known.";
      default:
        return "Describe what needs to be repaired, installed, or inspected on your property.";
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > maxPhotos) {
      setPhotoError(`You can upload a maximum of ${maxPhotos} photos.`);
      return;
    }

    setIsProcessingPhoto(true);
    try {
      const processed: ProcessedPhoto[] = [];
      for (const file of files) {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
          setPhotoError("Only JPEG, PNG, and WebP images are supported.");
          continue;
        }
        const result = await processImageFile(file);
        processed.push(result);
      }
      onPhotosChange([...photos, ...processed]);
    } catch {
      setPhotoError("Failed to process image. Please try another file.");
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find((p) => p.id === id);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.previewUrl);
    }
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2
          id="step-heading"
          className="font-display text-xl sm:text-2xl font-bold text-ink mb-1.5 tracking-tight"
        >
          A few details
        </h2>
        <p className="text-sm text-steel-600">
          Tell us about the project for {service?.title || "your request"}.
        </p>
      </div>

      {/* Safety Notice for Troubleshooting */}
      {formType === "troubleshooting" && (
        <Notice type="safety" title="Immediate Safety Notice">
          If you see sparks, smoke, or smell burning, stop — leave the area immediately and call
          911. Do not use this form for emergencies.
        </Notice>
      )}

      {/* Conditional Fields based on formType */}
      <div className="space-y-5">
        {formType === "panel" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="panel-reason" required>
                Reason for panel upgrade
              </Label>
              <Select
                id="panel-reason"
                value={formState.panelReason || ""}
                onChange={(e) => onChange({ panelReason: e.target.value })}
                hasError={!!errors.panelReason || !!errors["details.reason"]}
                aria-describedby={errors.panelReason ? "panelReason-error" : undefined}
              >
                <option value="">Select reason...</option>
                {PANEL_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.panelReason || errors["details.reason"]) && (
                <FieldError id="panelReason-error">
                  {errors.panelReason || errors["details.reason"]}
                </FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="panel-property" required>
                Property type
              </Label>
              <Select
                id="panel-property"
                value={formState.panelPropertyType || ""}
                onChange={(e) => onChange({ panelPropertyType: e.target.value })}
                hasError={!!errors.panelPropertyType || !!errors["details.propertyType"]}
                aria-describedby={errors.panelPropertyType ? "panelProperty-error" : undefined}
              >
                <option value="">Select property type...</option>
                {PANEL_PROPERTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.panelPropertyType || errors["details.propertyType"]) && (
                <FieldError id="panelProperty-error">
                  {errors.panelPropertyType || errors["details.propertyType"]}
                </FieldError>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="panel-info">Current panel details (optional)</Label>
              <Input
                id="panel-info"
                type="text"
                maxLength={200}
                placeholder="e.g. 100A Square D, located in basement"
                value={formState.panelInfoKnown || ""}
                onChange={(e) => onChange({ panelInfoKnown: e.target.value })}
              />
              <Hint id="panel-info-hint">Only if already known. Do not open the panel.</Hint>
            </div>
          </div>
        )}

        {formType === "ev_charger" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ev-property" required>
                Property type
              </Label>
              <Select
                id="ev-property"
                value={formState.evPropertyType || ""}
                onChange={(e) => onChange({ evPropertyType: e.target.value })}
                hasError={!!errors.evPropertyType || !!errors["details.propertyType"]}
              >
                <option value="">Select property type...</option>
                {PROPERTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.evPropertyType || errors["details.propertyType"]) && (
                <FieldError>{errors.evPropertyType || errors["details.propertyType"]}</FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="ev-owns-charger" required>
                Do you already have the charger?
              </Label>
              <Select
                id="ev-owns-charger"
                value={formState.evOwnsCharger || ""}
                onChange={(e) => onChange({ evOwnsCharger: e.target.value })}
                hasError={!!errors.evOwnsCharger || !!errors["details.ownsCharger"]}
              >
                <option value="">Select option...</option>
                {OWNS_CHARGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.evOwnsCharger || errors["details.ownsCharger"]) && (
                <FieldError>{errors.evOwnsCharger || errors["details.ownsCharger"]}</FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="ev-install-location" required>
                Installation location
              </Label>
              <Select
                id="ev-install-location"
                value={formState.evInstallLocation || ""}
                onChange={(e) => onChange({ evInstallLocation: e.target.value })}
                hasError={!!errors.evInstallLocation || !!errors["details.installLocation"]}
              >
                <option value="">Select location...</option>
                {INSTALL_LOCATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.evInstallLocation || errors["details.installLocation"]) && (
                <FieldError>
                  {errors.evInstallLocation || errors["details.installLocation"]}
                </FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="ev-vehicle">Vehicle or charger model (optional)</Label>
              <Input
                id="ev-vehicle"
                type="text"
                maxLength={120}
                placeholder="e.g. Tesla Model Y / Wall Connector"
                value={formState.evVehicleOrCharger || ""}
                onChange={(e) => onChange({ evVehicleOrCharger: e.target.value })}
              />
            </div>
          </div>
        )}

        {formType === "troubleshooting" && (
          <div>
            <Label htmlFor="trouble-started" required>
              When did the issue start?
            </Label>
            <Select
              id="trouble-started"
              value={formState.troubleStartedWhen || ""}
              onChange={(e) => onChange({ troubleStartedWhen: e.target.value })}
              hasError={!!errors.troubleStartedWhen || !!errors["details.startedWhen"]}
            >
              <option value="">Select timeframe...</option>
              {STARTED_WHEN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            {(errors.troubleStartedWhen || errors["details.startedWhen"]) && (
              <FieldError>{errors.troubleStartedWhen || errors["details.startedWhen"]}</FieldError>
            )}
          </div>
        )}

        {formType === "lighting" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lighting-setting" required>
                Location
              </Label>
              <Select
                id="lighting-setting"
                value={formState.lightingSetting || ""}
                onChange={(e) => onChange({ lightingSetting: e.target.value })}
                hasError={!!errors.lightingSetting || !!errors["details.setting"]}
              >
                <option value="">Select setting...</option>
                {LIGHTING_SETTING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.lightingSetting || errors["details.setting"]) && (
                <FieldError>{errors.lightingSetting || errors["details.setting"]}</FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="lighting-count" required>
                Fixture count
              </Label>
              <Select
                id="lighting-count"
                value={formState.lightingFixtureCount || ""}
                onChange={(e) => onChange({ lightingFixtureCount: e.target.value })}
                hasError={!!errors.lightingFixtureCount || !!errors["details.fixtureCount"]}
              >
                <option value="">Select count...</option>
                {FIXTURE_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.lightingFixtureCount || errors["details.fixtureCount"]) && (
                <FieldError>
                  {errors.lightingFixtureCount || errors["details.fixtureCount"]}
                </FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="lighting-type" required>
                Type of work
              </Label>
              <Select
                id="lighting-type"
                value={formState.lightingInstallType || ""}
                onChange={(e) => onChange({ lightingInstallType: e.target.value })}
                hasError={!!errors.lightingInstallType || !!errors["details.installType"]}
              >
                <option value="">Select type...</option>
                {INSTALL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.lightingInstallType || errors["details.installType"]) && (
                <FieldError>
                  {errors.lightingInstallType || errors["details.installType"]}
                </FieldError>
              )}
            </div>
          </div>
        )}

        {formType === "generator" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="generator-type" required>
                Generator configuration
              </Label>
              <Select
                id="generator-type"
                value={formState.generatorType || ""}
                onChange={(e) => onChange({ generatorType: e.target.value })}
                hasError={!!errors.generatorType || !!errors["details.generatorType"]}
              >
                <option value="">Select configuration...</option>
                {GENERATOR_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.generatorType || errors["details.generatorType"]) && (
                <FieldError>{errors.generatorType || errors["details.generatorType"]}</FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="generator-property" required>
                Property type
              </Label>
              <Select
                id="generator-property"
                value={formState.generatorPropertyType || ""}
                onChange={(e) => onChange({ generatorPropertyType: e.target.value })}
                hasError={!!errors.generatorPropertyType || !!errors["details.propertyType"]}
              >
                <option value="">Select property type...</option>
                {PROPERTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {(errors.generatorPropertyType || errors["details.propertyType"]) && (
                <FieldError>
                  {errors.generatorPropertyType || errors["details.propertyType"]}
                </FieldError>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="generator-requirements">
                Capacity or circuit requirements (optional)
              </Label>
              <Input
                id="generator-requirements"
                type="text"
                maxLength={500}
                placeholder="e.g. Essential circuits (refrigerator, well pump, furnace)"
                value={formState.generatorRequirements || ""}
                onChange={(e) => onChange({ generatorRequirements: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Project Description */}
        <div>
          <Label htmlFor="description" required>
            Description of work needed
          </Label>
          <Textarea
            id="description"
            rows={4}
            value={formState.description}
            onChange={(e) => onChange({ description: e.target.value })}
            hasError={!!errors.description}
            aria-describedby="description-hint"
          />
          <Hint id="description-hint">{getServiceHint()}</Hint>
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </div>

        {/* Photo Uploads */}
        {uploads.enabled && (
          <div className="pt-4 border-t border-steel-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="photo-upload">Photos (optional, up to {maxPhotos})</Label>
              <span className="font-mono text-xs text-steel-500">
                {photos.length} / {maxPhotos} attached
              </span>
            </div>

            <p className="text-xs text-steel-600 leading-relaxed">
              Never open a panel, remove covers, or go near exposed wiring to take a photo. A photo
              of the area or the outside label is plenty.
            </p>

            {photos.length < maxPhotos && (
              <div>
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoUpload}
                  className="sr-only"
                  disabled={isProcessingPhoto}
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-steel-300 rounded-md hover:border-steel-400 bg-steel-50/50 hover:bg-steel-50 cursor-pointer transition-colors select-none"
                >
                  <UploadCloud className="w-6 h-6 text-steel-500 mb-2" aria-hidden="true" />
                  <span className="text-sm font-medium text-ink">
                    {isProcessingPhoto ? "Processing image..." : "Upload photos"}
                  </span>
                  <span className="text-xs text-steel-500 mt-0.5">JPEG, PNG, WebP up to 4MB</span>
                </label>
              </div>
            )}

            {photoError && (
              <div className="flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Thumbnails */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative rounded-md border border-steel-200 overflow-hidden bg-steel-100 p-1 group"
                  >
                    <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-steel-200">
                      <Image
                        src={photo.previewUrl}
                        alt="Uploaded project preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1 px-1">
                      <span className="font-mono text-[10px] text-steel-600">
                        {formatFileSize(photo.sizeBytes)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="text-steel-500 hover:text-danger p-0.5 rounded-sm focus-visible:outline-2 focus-visible:outline-signal-blue"
                        aria-label="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </Button>

        <Button type="button" variant="primary" size="lg" onClick={onNext}>
          <span>Continue to contact</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
