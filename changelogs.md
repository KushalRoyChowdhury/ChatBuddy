# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note on Future Updates**: With the release of `ChatBuddy v2.2.2`, this project is now considered feature-complete. For long-term reliability, feel free to fork the `v2.2.2-LTS` & above.

## [2.3.2-LTS] - 2025-11-14

### Fixed
- Improved List rendering. 

## [2.3.1-LTS] - 2025-11-07

### Added
- Advance Rendering toggle to turn off visual transparency and improve performance.

### Fixed
- Improved Performance in Dark Mode.
- Tuned Glassmorphism.
- UI Enhancements.
- Improved and fast login flow. 

## [2.3.0-LTS] - 2025-11-06

### Added
- Auto Dark-Mode.

### Fixed
- UI Enhancements.
- Tuned Glassmorphism.
- Table Rendering on Small Screens.

## [2.2.5-LTS] - 2025-11-04

### Fixed
- Enhanced Rendering of LaTeX Equations (Physics, Chemistry).
- UI Fixes.
- Issue where File UI disappears after uploading a file.
- UI Stability.

### Changed
- Tuned Model's Generation Parameters.

## [2.2.4-LTS] - 2025-11-02

### Fixed
- Improved Model Responses.
- Improved Memory Stability.
- Reduced Memory Repeatation.
- Error 400 if prompted in numbers.
- Better Poem and story formatting.
- Improved Text-Size rendering for small screens.
- Improved Time Awareness.
- Improved Animations.

### Changed
- Blured Elements.

## [2.2.3-LTS] - 2025-10-31

### Fixed
- UI Stability.
- Performance Improvements.
- Improved Security.

### Changed
- Dynamic Cloud Sync.
- Images older than 48hrs will be deleted due to localStorage constraints.
- Clears localStorage on token expiration & authentication failure.
- Deleting `chatbuddy_data.bin` from Google Drive may result in data loss.

## [2.2.2-LTS] - 2025-10-30

### Fixed
- Sidepanel Animation.
- Go To Bottom button.
- Auto-Scroll.
- Improved general experience.

### Changed
- Improved Data Compression (Backward Compatible & Auto-Migration).
- Real-Time local time awareness on models.
- Clears localStorage on logout. 

## [2.2.1-LTS] - 2025-10-29

### Fixed
- App Data Import.

### Changed
- UI Improvements.

## [2.2-LTS] - 2025-10-28
**Major Patch Update**

### Added
- Auto Generated Chat-Title.

### Fixed
- Improved Token Efficiency. Now experience longer conversations with same context windows.
- UI Improvements.
- Memory Improvements & Stability (Now handled by separate model).
- Improved Image Handling for performance.
- Improved Data Security.
- Optimized Network Bandwidth.
- Improved Stability for better experience.

### Changed
- Memory Management Flow.
- Image Generation will be available till 2025-NOV-12.
- Increased daily Image Generation limit from 10 to 25.

## [2.1.1] - 2025-10-21

### Added
- Global Login with Google support.

### Fixed
- Improved Cloud Sync Responsiveness.
- Improved Personalization.
- UI Enhancements.

## [2.1.0] - 2025-10-21

### Added
- Cloud Sync Support (via USER Google Drive).

### Changed
- UI Enhancements & customization.

## [2.0.0] - 2025-10-20

### Added
- Multi-Chat Support.

### Changed
- UI Enhancements for more features and modern design.
- Reduced Visual Clutter.
- Video Sharing now support upto 50MB.

## [1.6.1] - 2025-10-13

### Fixed
- Better rendering of complex Mathematical Equations.
- Performance improvements for weak Single-Core CPUs.
- Improved power efficiency.

## [1.6] - 2025-10-11

### Added
- Video & Audio Sharing Support upto 20MB (Advance Model Only).

### Fixed
- Improved Context Handling with Files.

## [1.5.3] - 2025-10-09

### Fixed
- Model Improvements.

## [1.5.1] - 2025-09-20

### Fixed
- Minor UI fixes.
  

## [1.5] - 2025-09-18

### Added
- Image Generation (1024x1024).
- File Sharing Support 'PDF, TXT, DOCX etc' (Advance Model Only).

### Fixed
- Performance Improvement especially on low end hardware.
- Model Awareness.


## [1.4.1] - 2025-09-17

### Fixed
- Improved stability on image sharing (now support upto 20MB).
- Minor bug fixes.
- ReTuned Censorship to maintain expressiveness.


## [1.4] - 2025-09-16

### Added
- Added Image Sharing Feature (All Models). 

### Fixed
- All issues happened with v1.3 are now resolved and tested.
- Public version updated to latest release.

  
## [1.3] - 2025-09-15
> **NOTICE: [SEP 15 Update]** *Due to major instability in recent release (v1.3) the updates on Public server were reverted temporarily to older version (v1.2.2).*


> *This is a huge upgrade architechtural upgrade than previous one, if you face any bugs or issues kindly mention in GitHub.*

### Fixed
- Major changes in server side to make responses consistent.
- Major improvement in Advance Reasoning for more deep think on complex tasks.
- Uses latest GenAI SDK.


## [1.2] - 2025-09-14

### Added
- Transparency in Model Thinking (Advance Reasoning).
- Added Google Search Functionality (Advance Model Only).
- Added a 'Creative Response' mode (Basic Model Only).

### Fixed
- UI Scroll Bug Fixes on mobile devices.


## [1.1.2] - 2025-09-13

### Fixed
- Some UI alignment issues.
- Improve UX in mobile devices.

### Changed
- Some UI changes to feel more modern and for future compatibility.
- Tuned to be more *Creative* and *Accurate*.


## [1.1.1] - 2025-09-12

### Fixed
- Import/Export Memory button not showing.


## [1.1.0] - 2025-09-12

### Added
- Import Chat Functionality.
- Export as JSON.

### Fixed
- Resolved a bug that could cause excessive "thinking" time before the AI responded.


## [1.0.0] - 2025-09-08

### Added
- Initial release of the project as Open-Source.

*Thank you for using ChatBuddy!*
