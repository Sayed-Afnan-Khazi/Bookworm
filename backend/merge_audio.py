import wave

def merge_audio_files(speaker1_files, speaker2_files, output_path):
    """
    Merge WAV files from two speakers alternately into one podcast
    
    Args:
        speaker1_files (list): List of file paths for speaker 1
        speaker2_files (list): List of file paths for speaker 2
        output_path (str): Path for output WAV file
    """
    
    # Open first file to get parameters
    with wave.open(speaker1_files[0], 'rb') as first_file:
        params = first_file.getparams()
    
    # Create output file with same parameters
    with wave.open(output_path, 'wb') as output:
        output.setparams(params)
        
        # Alternate between speakers
        for i in range(max(len(speaker1_files), len(speaker2_files))):
            # Add speaker 1 audio if available
            if i < len(speaker1_files):
                with wave.open(speaker1_files[i], 'rb') as speaker1:
                    output.writeframes(speaker1.readframes(speaker1.getnframes()))
            
            # Add speaker 2 audio if available
            if i < len(speaker2_files):
                with wave.open(speaker2_files[i], 'rb') as speaker2:
                    output.writeframes(speaker2.readframes(speaker2.getnframes()))

# Example usage
if __name__ == "__main__":
    speaker1_files = [
        "./backend/podcasts/audio1.wav",
        "./backend/podcasts/audio2.wav",
        "./backend/podcasts/audio3.wav"
    ]
    
    speaker2_files = [
        "./backend/podcasts/audio4.wav",
        "./backend/podcasts/audio5.wav",
        "./backend/podcasts/audio6.wav"
    ]
    
    output_path = "./backend/podcasts/final_podcast.wav"
    merge_audio_files(speaker1_files, speaker2_files, output_path)