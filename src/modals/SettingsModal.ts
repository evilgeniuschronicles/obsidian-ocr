import {Modal, Setting} from "obsidian";
import FileSpecificSettings from "../db/FileSpecificSettings";
import DBManager from "../db/DBManager";

/**
 * Modal used to display and change transcript-specific settings
 * */
export default class SettingsModal extends Modal {

	private readonly settings: FileSpecificSettings;

	constructor(private readonly filePath: string) {
		super(app);
		const transcript = DBManager.getTranscriptByPath(filePath);
		if (!DBManager.getSettingsByTranscriptId(transcript.transcriptId)) this.settings = FileSpecificSettings.DEFAULT();
		else this.settings = DBManager.getSettingsByTranscriptId(transcript.transcriptId);
	}

	override onOpen() {
		this.contentEl.replaceChildren();
		new Setting(this.contentEl).addSlider((sc) => {
			sc.setLimits(50, 300, 10);
			sc.setValue(this.settings.imageDensity);
			sc.setDynamicTooltip();
			sc.onChange((value) => {
				this.settings.imageDensity = value;
			});
		}).setName("Image density").setDesc("Image density of converted PDFs");
		new Setting(this.contentEl).addSlider((sc) => {
			sc.setLimits(50, 100, 1);
			sc.setValue(this.settings.imageQuality);
			sc.setDynamicTooltip();
			sc.onChange((value) => {
				this.settings.imageDensity = value;
			});
		}).setName("Image quality").setDesc("Image quality of converted PDFs");
		new Setting(this.contentEl).addText((tc) => {
			tc.setValue(this.settings.imagemagickArgs);
			tc.setPlaceholder("Additional imagemagick args");
			tc.onChange((value) => {
				this.settings.imagemagickArgs = value;
			});
		}).setName("Additional imagemagick args")
			.setDesc("Additional args passed to imagemagick when converting PDF to PNGs");
		new Setting(this.contentEl).addToggle((tc) => {
			tc.setValue(this.settings.ignore);
			tc.onChange((value) => {
				this.settings.ignore = value;
			});
		}).setName("Ignore file").setDesc("Ignore this file for OCR");
		new Setting(this.contentEl).addButton(bc => {
			bc.setButtonText("Cancel");
			bc.setWarning();
			bc.onClick(() => {
				this.close();
			});
		}).addButton((bc) => {
			bc.setButtonText("Remove");
			bc.setWarning();
			bc.onClick(async () => {
				const transcript = DBManager.getTranscriptByPath(this.filePath);
				DBManager.removeSettingsByTranscriptId(transcript.transcriptId);
				await DBManager.saveDB();
				this.close();
			});
		}).addButton((bc) => {
			bc.setButtonText("Save");
			bc.onClick(async () => {
				const transcript = DBManager.getTranscriptByPath(this.filePath);
				DBManager.setSettingsByTranscriptId(transcript.transcriptId, this.settings);
				await DBManager.saveDB();
				this.close();
			});
		});
	}
}